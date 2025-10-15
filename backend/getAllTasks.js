// getAllTasks.js
const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME;

exports.handler = async () => {
  const params = {
    TableName: TABLE_NAME,
  };
  const data = await dynamo.scan(params).promise();
  return {
    statusCode: 200,
    body: JSON.stringify(data.Items || []),
  };
};