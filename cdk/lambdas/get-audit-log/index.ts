import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { withCors } from '@utils/cors';
import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';

const ddbClient = new DynamoDBClient();
const ddb = DynamoDBDocumentClient.from(ddbClient);

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    const scenarioId = event.pathParameters?.id;

    if (!scenarioId) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'scenarioId is required' }),
        };
    }

    const result = await ddb.send(
        new QueryCommand({
            TableName: process.env.AUDIT_TABLE_NAME,
            KeyConditionExpression: 'scenarioId = :scenarioId',
            ExpressionAttributeValues: {
                ':scenarioId': scenarioId,
            },
            ScanIndexForward: false, // newest first
        })
    );

    const events = result.Items ?? [];

    if (events.length === 0) {
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json', ...withCors(event) },
            body: JSON.stringify(null),
        };
    }

    return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json', ...withCors(event) },
        body: JSON.stringify({
            scenarioId,
            events,
        }),
    };
};
