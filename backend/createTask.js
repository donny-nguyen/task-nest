const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = 'Tasks';

exports.handler = async (event) => {
  const body = JSON.parse(event.body);
  const taskId = uuidv4();

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

  await dynamo.put({ TableName: TABLE_NAME, Item: item }).promise();

  // Update parent task with this subtask
  if (item.ParentTaskID) {
    await dynamo.update({
      TableName: TABLE_NAME,
      Key: { TaskID: item.ParentTaskID },
      UpdateExpression: 'SET SubTaskIDs = list_append(if_not_exists(SubTaskIDs, :empty), :new)',
      ExpressionAttributeValues: {
        ':new': [taskId],
        ':empty': []
      }
    }).promise();
  }

  // Update previous task with this as next
  if (item.PreviousTaskID) {
    await dynamo.update({
      TableName: TABLE_NAME,
      Key: { TaskID: item.PreviousTaskID },
      UpdateExpression: 'SET NextTaskID = :next',
      ExpressionAttributeValues: { ':next': taskId }
    }).promise();
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ TaskID: taskId })
  };
};
