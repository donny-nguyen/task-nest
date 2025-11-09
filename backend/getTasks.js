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

    // Filter tasks by parentTaskID
    const filteredTasks = parentTaskID
      ? allTasks.filter(task => task.ParentTaskID === parentTaskID)
      : allTasks.filter(task => !task.ParentTaskID);

    // Order tasks by PreviousTaskID
    function orderTasks(tasks) {
      if (!tasks.length) return [];
      // Find the first task (no PreviousTaskID or PreviousTaskID is empty)
      let firstTask = tasks.find(task => !task.PreviousTaskID || task.PreviousTaskID === '');
      if (!firstTask) return tasks; // fallback: return as is

      const ordered = [firstTask];
      let currentTask = firstTask;
      while (ordered.length < tasks.length) {
        const nextTask = tasks.find(task => task.PreviousTaskID === currentTask.TaskID);
        if (!nextTask) break;
        ordered.push(nextTask);
        currentTask = nextTask;
      }
      return ordered;
    }

    const orderedTasks = orderTasks(filteredTasks);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // Allow all origins (you can restrict to http://localhost:3000)
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "OPTIONS,GET,POST"
      },
      body: JSON.stringify(orderedTasks),
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
