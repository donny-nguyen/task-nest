import { randomUUID } from 'crypto';
import { DynamoDBClient, PutItemCommand, UpdateItemCommand, ScanCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

const client = new DynamoDBClient({});
const TABLE_NAME = process.env.TABLE_NAME;

export const handler = async (event) => {
  const body = JSON.parse(event.body);
  const taskId = randomUUID();

  let previousTaskID = body.PreviousTaskID || '';
  
  // If this is a minimal task (no ParentTaskID and no PreviousTaskID specified)
  // Find the last top-level task and link to it
  if (!body.ParentTaskID && !body.PreviousTaskID) {
    const lastTopLevelTask = await findLastTopLevelTask();
    if (lastTopLevelTask) {
      previousTaskID = lastTopLevelTask.TaskID;
    }
  }

  const item = {
    TaskID: taskId,
    Title: body.Title,
    Description: body.Description || '',
    ParentTaskID: body.ParentTaskID || '',
    PreviousTaskID: previousTaskID,
    NextTaskID: '',
    SubTaskIDs: [],
    IsCurrentTask: body.SetAsCurrent || false
  };

  await client.send(new PutItemCommand({
    TableName: TABLE_NAME,
    Item: marshall(item)
  }));

  // Update parent task with this subtask
  if (item.ParentTaskID) {
    await client.send(new UpdateItemCommand({
      TableName: TABLE_NAME,
      Key: marshall({ TaskID: item.ParentTaskID }),
      UpdateExpression: 'SET SubTaskIDs = list_append(if_not_exists(SubTaskIDs, :empty), :new)',
      ExpressionAttributeValues: marshall({
        ':new': [taskId],
        ':empty': []
      })
    }));
  }

  // Update previous task with this as next
  if (item.PreviousTaskID) {
    await client.send(new UpdateItemCommand({
      TableName: TABLE_NAME,
      Key: marshall({ TaskID: item.PreviousTaskID }),
      UpdateExpression: 'SET NextTaskID = :next',
      ExpressionAttributeValues: marshall({ ':next': taskId })
    }));
  }

  return {
    statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "OPTIONS,POST"
      },
    body: JSON.stringify({ TaskID: taskId })
  };
};

// Helper function to find the last top-level task
async function findLastTopLevelTask() {
  try {
    // Scan for all top-level tasks (no ParentTaskID and no NextTaskID)
    const response = await client.send(new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: '(attribute_not_exists(ParentTaskID) OR ParentTaskID = :empty) AND (attribute_not_exists(NextTaskID) OR NextTaskID = :empty)',
      ExpressionAttributeValues: marshall({
        ':empty': ''
      })
    }));

    if (!response.Items || response.Items.length === 0) {
      return null;
    }

    // Unmarshall all items
    const tasks = response.Items.map(item => unmarshall(item));
    
    // Return the first one found (there should only be one "last" task)
    // If multiple exist, return the first one
    return tasks[0];
  } catch (error) {
    console.error('Error finding last top-level task:', error);
    return null;
  }
}