import { DynamoDB } from 'aws-sdk';

const dynamo = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME;

export const handler = async (event) => {
  const body = JSON.parse(event.body);
  const targetId = body.TaskID;

  // Step 1: Get the target task
  const targetTask = await dynamo.get({
    TableName: TABLE_NAME,
    Key: { TaskID: targetId }
  }).promise();

  if (!targetTask.Item) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'Task not found' })
    };
  }

  const parentId = targetTask.Item.ParentTaskID || '';

  // Step 2: Scan for sibling tasks
  const siblings = await dynamo.scan({
    TableName: TABLE_NAME,
    FilterExpression: 'ParentTaskID = :pid',
    ExpressionAttributeValues: { ':pid': parentId }
  }).promise();

  // Step 3: Update each sibling
  const updates = siblings.Items.map(task => {
    const isCurrent = task.TaskID === targetId;
    return dynamo.update({
      TableName: TABLE_NAME,
      Key: { TaskID: task.TaskID },
      UpdateExpression: 'SET IsCurrentTask = :val',
      ExpressionAttributeValues: { ':val': isCurrent }
    }).promise();
  });

  await Promise.all(updates);

  return {
    statusCode: 200,
    body: JSON.stringify({ message: `Task ${targetId} set as current among siblings` })
  };
};