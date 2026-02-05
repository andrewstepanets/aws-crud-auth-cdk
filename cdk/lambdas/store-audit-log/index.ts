import { AttributeValue, DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { DynamoDBStreamEvent, DynamoDBStreamHandler } from 'aws-lambda';

const ddbClient = new DynamoDBClient();
const ddb = DynamoDBDocumentClient.from(ddbClient);

const actionMap: Record<string, string> = {
    INSERT: 'CREATE',
    MODIFY: 'UPDATE',
    REMOVE: 'DELETE',
};

export const handler: DynamoDBStreamHandler = async (event: DynamoDBStreamEvent) => {
    for (const record of event.Records) {
        try {
            console.log('Processing record ID:', record.eventID);
            console.log('Event Name:', record.eventName);

            const oldImage = record.dynamodb?.OldImage
                ? unmarshall(record.dynamodb.OldImage as Record<string, AttributeValue>)
                : null;
            const newImage = record.dynamodb?.NewImage
                ? unmarshall(record.dynamodb.NewImage as Record<string, AttributeValue>)
                : null;

            const action = actionMap[record.eventName ?? ''] ?? 'UNKNOWN';
            const scenarioId = newImage?.id || oldImage?.id;
            const ticket = newImage?.ticket || oldImage?.ticket;
            const performedBy = newImage?.updatedBy || oldImage?.updatedBy;

            const auditLog = {
                scenarioId: scenarioId,
                timestamp: new Date().toISOString(),
                ticket,
                action,
                performedBy,
                requestId: record.eventID,
            };

            await ddb.send(
                new PutCommand({
                    TableName: process.env.AUDIT_TABLE_NAME,
                    Item: auditLog,
                })
            );
            console.log(`Successfully logged ${record.eventName} for scenario ${scenarioId}`);
        } catch (error) {
            console.error('Error writing to Audit Table:', error);
        }
    }
};
