exports.handler = async () => {
  const result = await dynamo.scan({
    TableName: TABLE_NAME,
    FilterExpression: 'IsCurrentTask = :val',
    ExpressionAttributeValues: { ':val': true }
  }).promise();

  const currentTask = result.Items[0] || null;

  return {
    statusCode: 200,
    body: JSON.stringify(currentTask)
  };
};
