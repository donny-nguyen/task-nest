import { DynamoDBClient, GetItemCommand, ScanCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

const client = new DynamoDBClient({});
const TABLE_NAME = process.env.TABLE_NAME;

export const handler = async (event) => {
  const body = JSON.parse(event.body);
  const targetId = body.TaskID;

  // Step 1: Get the target task
  const targetTask = await client.send(new GetItemCommand({
    TableName: TABLE_NAME,
    Key: marshall({ TaskID: targetId })
  }));

  if (!targetTask.Item) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'Task not found' })
    };
  }

  const parentId = unmarshall(targetTask.Item).ParentTaskID || '';

  // Step 2: Scan for sibling tasks
  const siblings = await client.send(new ScanCommand({
    TableName: TABLE_NAME,
    FilterExpression: 'ParentTaskID = :pid',
    ExpressionAttributeValues: marshall({ ':pid': parentId })
  }));

  // Step 3: Update each sibling
  const updates = siblings.Items.map(task => {
    const taskData = unmarshall(task);
    const isCurrent = taskData.TaskID === targetId;
    return client.send(new UpdateItemCommand({
      TableName: TABLE_NAME,
      Key: marshall({ TaskID: taskData.TaskID }),
      UpdateExpression: 'SET IsCurrentTask = :val',
      ExpressionAttributeValues: marshall({ ':val': isCurrent })
    }));
  });

  await Promise.all(updates);

  return {
    statusCode: 200,
    body: JSON.stringify({ message: `Task ${targetId} set as current among siblings` })
  };
};