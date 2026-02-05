import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
    DeleteCommand,
    DynamoDBDocumentClient,
    GetCommandOutput,
    PutCommand,
    QueryCommand,
    UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { withCors } from '@utils/cors';
import { APIGatewayEvent, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';

interface Scenario {
    id: string;
    pk?: string;
    ticket: string;
    title: string;
    description: string;
    steps: string[];
    expectedResult: string;
    components: string[];
    createdBy: string;
    createdAt: string;
}

const TABLE_NAME = process.env.SCENARIOS_TABLE_NAME;

if (!TABLE_NAME) {
    throw new Error('SCENARIOS_TABLE_NAME is not defined');
}

const client = new DynamoDBClient();
const ddb = DynamoDBDocumentClient.from(client);

export const getAll = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    const queryParams = event.queryStringParameters || {};
    const limit = parseInt(queryParams.limit || '5');
    const { createdBy } = queryParams;

    const nextKey = queryParams.nextKey
        ? JSON.parse(Buffer.from(queryParams.nextKey, 'base64').toString('utf8'))
        : undefined;
    let result;

    if (createdBy) {
        result = await ddb.send(
            new QueryCommand({
                TableName: TABLE_NAME,
                IndexName: 'createdBy-index',
                KeyConditionExpression: 'createdBy = :author',
                ExpressionAttributeValues: {
                    ':author': createdBy,
                },
                Limit: limit,
                ExclusiveStartKey: nextKey,
                ScanIndexForward: false,
            })
        );
    } else {
        result = await ddb.send(
            new QueryCommand({
                TableName: TABLE_NAME,
                KeyConditionExpression: 'pk = :pkValue',
                ExpressionAttributeValues: {
                    ':pkValue': 'SCENARIO',
                },
                Limit: limit,
                ExclusiveStartKey: nextKey,
                ScanIndexForward: false,
            })
        );
    }

    let items = (result.Items ?? []).map(mapScenarioResponse);

    const response = {
        items,
        nextKey: result.LastEvaluatedKey
            ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64')
            : undefined,
    };

    return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json', ...withCors(event) },
        body: JSON.stringify(response),
    };
};

export const getById = async (id?: string, event?: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    if (!id) {
        return {
            statusCode: 400,
            headers: { 'Content-Type': 'application/json', ...withCors(event) },
            body: JSON.stringify({ message: 'missing id' }),
        };
    }

    const item = await findScenarioById(id);

    if (!item) {
        return {
            statusCode: 404,
            headers: { 'Content-Type': 'application/json', ...withCors(event) },
            body: JSON.stringify({ message: 'not found' }),
        };
    }

    return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json', ...withCors(event) },
        body: JSON.stringify(mapScenarioResponse(item)),
    };
};

export const create = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    if (!event.body) {
        return {
            statusCode: 400,
            headers: { 'Content-Type': 'application/json', ...withCors(event) },
            body: JSON.stringify({ message: 'invalid request body' }),
        };
    }

    const body = JSON.parse(event.body);

    const now = new Date().toISOString();
    const actor = event.requestContext.authorizer?.claims?.email;

    const item = {
        id: uuidv4(),
        pk: 'SCENARIO',
        ticket: body.ticket ?? '',
        title: body.title ?? '',
        description: body.description ?? '',
        steps: Array.isArray(body.steps) ? body.steps : [],
        expectedResult: body.expectedResult ?? '',
        components: Array.isArray(body.components) ? body.components : [],
        createdBy: actor,
        createdAt: now,
        updatedBy: actor,
        updatedAt: now,
    };

    await ddb.send(
        new PutCommand({
            TableName: TABLE_NAME,
            Item: item,
        })
    );

    return {
        statusCode: 201,
        headers: { 'Content-Type': 'application/json', ...withCors(event) },
        body: JSON.stringify(mapScenarioResponse(item)),
    };
};

export const update = async (id?: string, event?: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    if (!id) {
        return {
            statusCode: 400,
            headers: { 'Content-Type': 'application/json', ...withCors(event) },
            body: JSON.stringify({ message: 'missing id' }),
        };
    }

    if (!event?.body) {
        return {
            statusCode: 400,
            headers: { 'Content-Type': 'application/json', ...withCors(event) },
            body: JSON.stringify({ message: 'missing request body' }),
        };
    }

    const body = JSON.parse(event.body);

    const item = await findScenarioById(id);

    if (!item) {
        return {
            statusCode: 404,
            headers: { 'Content-Type': 'application/json', ...withCors(event) },
            body: JSON.stringify({ message: 'not found' }),
        };
    }

    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, unknown> = {};
    const updates: string[] = [];

    const updatableFields = ['title', 'description', 'steps', 'expectedResult', 'components'];

    updatableFields.forEach(field => {
        if (field in body) {
            const nameKey = `#${field}`;
            const valueKey = `:${field}`;

            expressionAttributeNames[nameKey] = field;
            expressionAttributeValues[valueKey] = body[field];
            updates.push(`${nameKey} = ${valueKey}`);
        }
    });

    if (updates.length === 0) {
        return {
            statusCode: 400,
            headers: { 'Content-Type': 'application/json', ...withCors(event) },
            body: JSON.stringify({ message: 'no fields to update' }),
        };
    }

    // audit

    const actor = event.requestContext.authorizer?.claims?.email ?? 'unknown';
    const now = new Date().toISOString();

    expressionAttributeNames['#updatedBy'] = 'updatedBy';
    expressionAttributeNames['#updatedAt'] = 'updatedAt';

    expressionAttributeValues[':updatedBy'] = actor;
    expressionAttributeValues[':updatedAt'] = now;

    updates.push('#updatedBy = :updatedBy');
    updates.push('#updatedAt = :updatedAt');

    const result = await ddb.send(
        new UpdateCommand({
            TableName: TABLE_NAME,
            Key: {
                pk: item.pk,
                createdAt: item.createdAt,
            },
            UpdateExpression: `SET ${updates.join(', ')}`,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: 'ALL_NEW',
        })
    );

    return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json', ...withCors(event) },
        body: JSON.stringify(mapScenarioResponse(result.Attributes)),
    };
};

export const remove = async (id?: string, event?: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    if (!id) {
        return {
            statusCode: 400,
            headers: { 'Content-Type': 'application/json', ...withCors(event) },
            body: JSON.stringify({ message: 'missing id' }),
        };
    }

    const item = await findScenarioById(id);

    if (!item) {
        return {
            statusCode: 404,
            headers: { 'Content-Type': 'application/json', ...withCors(event) },
            body: JSON.stringify({ message: 'not found' }),
        };
    }

    await ddb.send(
        new DeleteCommand({
            TableName: TABLE_NAME,
            Key: {
                pk: item.pk,
                createdAt: item.createdAt,
            },
        })
    );

    return {
        statusCode: 204,
        headers: { 'Content-Type': 'application/json', ...withCors(event) },
        body: '',
    };
};

export const methodNotAllowed = (): APIGatewayProxyResult => {
    return {
        statusCode: 405,
        headers: {
            'Content-Type': 'application/json',
            Allow: 'GET,POST,PUT,DELETE',
        },
        body: JSON.stringify({ message: 'method not allowed' }),
    };
};

const mapScenarioResponse = (item: GetCommandOutput['Item']): Scenario => ({
    id: item?.id,
    ticket: item?.ticket,
    title: item?.title,
    description: item?.description,
    steps: item?.steps,
    expectedResult: item?.expectedResult,
    components: item?.components,
    createdBy: item?.createdBy,
    createdAt: item?.createdAt,
});

export const getUserGroups = (event: APIGatewayProxyEvent): string[] => {
    const claims = event.requestContext.authorizer?.claims;
    const groups = claims?.['cognito:groups'];

    if (!groups) return [];
    return Array.isArray(groups) ? groups : [groups];
};

export const isEditor = (groups: string[]) => groups.includes('editors');

export const forbidden = (event?: APIGatewayEvent) => ({
    statusCode: 403,
    headers: { 'Content-Type': 'application/json', ...withCors(event) },
    body: JSON.stringify({ message: 'forbidden' }),
});

const findScenarioById = async (id: string) => {
    const result = await ddb.send(
        new QueryCommand({
            TableName: TABLE_NAME,
            IndexName: 'id-index',
            KeyConditionExpression: 'id = :id',
            ExpressionAttributeValues: {
                ':id': id,
            },
            Limit: 1,
        })
    );
    return result.Items?.[0];
};
