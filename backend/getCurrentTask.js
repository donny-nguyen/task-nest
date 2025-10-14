const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = 'Tasks';

exports.handler = async () => {
  // Step 1: Get top-level current task
  let topLevel = await dynamo.scan({
    TableName: TABLE_NAME,
    FilterExpression: 'ParentTaskID = :empty',
    ExpressionAttributeValues: { ':empty': '' }
  }).promise();

  if (!topLevel.Items.length) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'No top-level tasks found' })
    };
  }

  // Prefer current task, fallback to first
  let currentTask = topLevel.Items.find(t => t.IsCurrentTask) || topLevel.Items[0];

  // Step 2: Traverse down current subtasks
  while (currentTask.SubTaskIDs && currentTask.SubTaskIDs.length > 0) {
    const subTasks = await dynamo.batchGet({
      RequestItems: {
        [TABLE_NAME]: {
          Keys: currentTask.SubTaskIDs.map(id => ({ TaskID: id }))
        }
      }
    }).promise();

    const children = subTasks.Responses[TABLE_NAME];
    if (!children.length) break;

    // Prefer current child, fallback to first
    const currentChild = children.find(t => t.IsCurrentTask) || children[0];
    currentTask = currentChild;
  }

  return {
    statusCode: 200,
    body: JSON.stringify(currentTask)
  };
};
