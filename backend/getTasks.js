import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';

const client = new DynamoDBClient({});
const TABLE_NAME = process.env.TABLE_NAME;

export const handler = async (event) => {
  const parentTaskID = event?.queryStringParameters?.parentTaskID ?? null;

  const params = {
    TableName: TABLE_NAME,
  };

  try {
    const data = await client.send(new ScanCommand(params));
    const allTasks = data.Items.map(item => unmarshall(item)) || [];

    const filteredTasks = parentTaskID
      ? allTasks.filter(task => task.ParentTaskID === parentTaskID)
      : allTasks.filter(task => !task.ParentTaskID);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // Allow all origins (you can restrict to http://localhost:3000)
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "OPTIONS,GET,POST"
      },
      body: JSON.stringify(filteredTasks),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "OPTIONS,GET,POST"
      },
      body: JSON.stringify({
        error: 'Failed to fetch tasks',
        details: error.message,
      }),
    };
  }
};
