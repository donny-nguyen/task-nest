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
      body: JSON.stringify(filteredTasks),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch tasks', details: error.message }),
    };
  }
};
