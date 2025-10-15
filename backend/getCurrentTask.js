import { DynamoDBClient, ScanCommand, BatchGetItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

const client = new DynamoDBClient({});
const TABLE_NAME = process.env.TABLE_NAME;

export const handler = async () => {
  // Step 1: Get top-level current task
  let topLevel = await client.send(new ScanCommand({
    TableName: TABLE_NAME,
    FilterExpression: 'ParentTaskID = :empty',
    ExpressionAttributeValues: marshall({ ':empty': '' })
  }));

  if (!topLevel.Items.length) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'No top-level tasks found' })
    };
  }

  // Prefer current task, fallback to first
  let currentTask = unmarshall(topLevel.Items.find(t => unmarshall(t).IsCurrentTask) || topLevel.Items[0]);

  // Step 2: Traverse down current subtasks
  while (currentTask.SubTaskIDs && currentTask.SubTaskIDs.length > 0) {
    const subTasks = await client.send(new BatchGetItemCommand({
      RequestItems: {
        [TABLE_NAME]: {
          Keys: currentTask.SubTaskIDs.map(id => marshall({ TaskID: id }))
        }
      }
    }));

    const children = subTasks.Responses[TABLE_NAME].map(item => unmarshall(item));
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