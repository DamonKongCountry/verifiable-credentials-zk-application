/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
// this is /user
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
  GetCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});

const dynamo = DynamoDBDocumentClient.from(client);

const tableName = "verifiable-credentials-zk-application-dynamodb";

exports.handler = async (event) => {
  console.log(`EVENT: ${JSON.stringify(event)}`);
  const users = event.pathParameters.users;
  try {
    switch (event.routeKey) {
      case "GET /user":
        body = await dynamo.send(
          new GetCommand({
            TableName: tableName,
            Key: {
              email: event.pathParameters.email,
            },
          })
        );
        body = body.Item;
        break;
      case "PUT /user":
        // email should be checked before entering
        let requestJSON = JSON.parse(event.body);
        await dynamo.send(
          new PutCommand({
            TableName: tableName,
            Item: {
              id: requestJSON.id,
              name: requestJSON.name || null,
              age: requestJSON.age || null,
              sex: requestJSON.sex || null,
              country: requestJSON.country || null,
              address: requestJSON.address || null,
              phone: requestJSON.phone || null,
              email: requestJSON.email || null,
              education: requestJSON.education || null,
              work: requestJSON.work || null,
            },
          })
        );
        body = `Put item ${requestJSON.id}`;
        console.log("POST request received");
        break;
      default:
        throw new Error(`Unsupported route: "${event.routeKey}"`);
    }
  } catch (err) {
    statusCode = 400;
    body = err.message;
  } finally {
    body = JSON.stringify(body);
  }
  return {
    statusCode: 200,
    //  Uncomment below to enable CORS requests
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*"
    },
    body: JSON.stringify(users),
  };
};