import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

const client = new DynamoDBClient({});
const TABLE_NAME = process.env.TABLE_NAME;

export const handler = async (event) => {
  // Support both path parameter and query string parameter for TaskID
  const taskID = event?.pathParameters?.taskID ?? event?.queryStringParameters?.taskID ?? null;

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "OPTIONS,GET,POST"
  };

  if (!taskID) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Missing required parameter: taskID' })
    };
  }

  try {
    const params = {
      TableName: TABLE_NAME,
      Key: marshall({ TaskID: taskID })
    };

    const data = await client.send(new GetItemCommand(params));

    if (!data.Item) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: `Task not found for TaskID=${taskID}` })
      };
    }

    const task = unmarshall(data.Item);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(task)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch task', details: error.message })
    };
  }
};
