import { randomUUID } from 'crypto';
import { DynamoDBClient, PutItemCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';

const client = new DynamoDBClient({});
const TABLE_NAME = process.env.TABLE_NAME;

export const handler = async (event) => {
  const body = JSON.parse(event.body);
  const taskId = randomUUID();

  const item = {
    TaskID: taskId,
    Title: body.Title,
    Description: body.Description || '',
    ParentTaskID: body.ParentTaskID || '',
    PreviousTaskID: body.PreviousTaskID || '',
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
    body: JSON.stringify({ TaskID: taskId })
  };
};