import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';

const client = new DynamoDBClient({});
const TABLE_NAME = process.env.TABLE_NAME;

export const handler = async () => {
  const params = {
    TableName: TABLE_NAME,
  };
  const data = await client.send(new ScanCommand(params));
  return {
    statusCode: 200,
    body: JSON.stringify(data.Items.map(item => unmarshall(item)) || [])
  };
};