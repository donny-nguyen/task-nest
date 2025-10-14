exports.handler = async (event) => {
  const body = JSON.parse(event.body);
  const newCurrentId = body.TaskID;

  const scan = await dynamo.scan({ TableName: TABLE_NAME, ProjectionExpression: 'TaskID' }).promise();

  const updates = scan.Items.map(item => {
    return dynamo.update({
      TableName: TABLE_NAME,
      Key: { TaskID: item.TaskID },
      UpdateExpression: 'SET IsCurrentTask = :val',
      ExpressionAttributeValues: {
        ':val': item.TaskID === newCurrentId
      }
    }).promise();
  });

  await Promise.all(updates);

  return {
    statusCode: 200,
    body: JSON.stringify({ message: `Task ${newCurrentId} set as current` })
  };
};
