const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = 'Tasks';

exports.handler = async () => {
  // Step 1: Get top-level current task
  const topLevel = await dynamo.scan({
    TableName: TABLE_NAME,
    FilterExpression: 'IsCurrentTask = :val AND (attribute_not_exists(ParentTaskID) OR ParentTaskID = :empty)',
    ExpressionAttributeValues: {
      ':val': true,
      ':empty': ''
    }
  }).promise();

  if (!topLevel.Items.length) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'No top-level current task found' })
    };
  }

  let currentTask = topLevel.Items[0];

  // Step 2: Traverse down current subtasks
  while (currentTask.SubTaskIDs && currentTask.SubTaskIDs.length > 0) {
    const subTasks = await dynamo.batchGet({
      RequestItems: {
        [TABLE_NAME]: {
          Keys: currentTask.SubTaskIDs.map(id => ({ TaskID: id }))
        }
      }
    }).promise();

    const currentChild = subTasks.Responses[TABLE_NAME].find(t => t.IsCurrentTask);

    if (!currentChild) break; // No current child — stop traversal

    currentTask = currentChild;
  }

  return {
    statusCode: 200,
    body: JSON.stringify(currentTask)
  };
};
