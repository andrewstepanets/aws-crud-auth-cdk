import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
    DeleteCommand,
    DynamoDBDocumentClient,
    GetCommand,
    GetCommandOutput,
    PutCommand,
    ScanCommand,
    UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { APIGatewayEvent, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';

interface Scenario {
    id: string;
    ticket: string;
    title: string;
    description: string;
    steps: string[];
    expectedResult: string;
    components: string[];
    createdBy: string;
    createdAt: string;
}

const ALLOWED_ORIGINS = ['http://localhost:3000', 'https://dgmpvfufnkjzg.cloudfront.net'];

const getCorsHeaders = (event?: APIGatewayEvent): Record<string, string> => {
    const origin = event?.headers?.origin;

    if (origin && ALLOWED_ORIGINS.includes(origin)) {
        return {
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Credentials': 'true',
        };
    }

    return {};
};

const TABLE_NAME = process.env.SCENARIOS_TABLE_NAME;

if (!TABLE_NAME) {
    throw new Error('SCENARIOS_TABLE_NAME is not defined');
}

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);

export const getAll = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    const result = await ddb.send(
        new ScanCommand({
            TableName: TABLE_NAME,
        })
    );

    const items = (result.Items ?? []).map(mapScenarioResponse);

    return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json', ...getCorsHeaders(event) },
        body: JSON.stringify({ items }),
    };
};

export const getById = async (id?: string, event?: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    const result = await ddb.send(
        new GetCommand({
            TableName: TABLE_NAME,
            Key: { id },
        })
    );

    if (!result.Item) {
        return {
            statusCode: 404,
            headers: { 'Content-Type': 'application/json', ...getCorsHeaders(event) },
            body: JSON.stringify({ message: 'not found' }),
        };
    }

    return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json', ...getCorsHeaders(event) },
        body: JSON.stringify(mapScenarioResponse(result.Item)),
    };
};

export const create = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    if (!event.body) {
        return {
            statusCode: 400,
            headers: { 'Content-Type': 'application/json', ...getCorsHeaders(event) },
            body: JSON.stringify({ message: 'invalid request body' }),
        };
    }

    const body = JSON.parse(event.body);

    const item = {
        id: uuidv4(),
        ticket: body.ticket ?? '',
        title: body.title ?? '',
        description: body.description ?? '',
        steps: Array.isArray(body.steps) ? body.steps : [],
        expectedResult: body.expectedResult ?? '',
        components: Array.isArray(body.components) ? body.components : [],
        createdBy: event.requestContext.authorizer?.claims?.email,
        createdAt: new Date().toISOString(),
    };

    await ddb.send(
        new PutCommand({
            TableName: TABLE_NAME,
            Item: item,
        })
    );

    return {
        statusCode: 201,
        headers: { 'Content-Type': 'application/json', ...getCorsHeaders(event) },
        body: JSON.stringify(item),
    };
};

export const update = async (id?: string, event?: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    if (!event?.body) {
        return {
            statusCode: 400,
            headers: { 'Content-Type': 'application/json', ...getCorsHeaders(event) },
            body: JSON.stringify({ message: 'missing request body' }),
        };
    }

    const body = JSON.parse(event.body);

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

    const result = await ddb.send(
        new UpdateCommand({
            TableName: TABLE_NAME,
            Key: { id },
            UpdateExpression: `SET ${updates.join(', ')}`,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
            ConditionExpression: 'attribute_exists(id)',
            ReturnValues: 'ALL_NEW',
        })
    );

    return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json', ...getCorsHeaders(event) },
        body: JSON.stringify(mapScenarioResponse(result.Attributes)),
    };
};

export const remove = async (id?: string, event?: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    await ddb.send(
        new DeleteCommand({
            TableName: TABLE_NAME,
            Key: { id },
        })
    );

    return {
        statusCode: 204,
        headers: { 'Content-Type': 'application/json', ...getCorsHeaders(event) },
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
    headers: { 'Content-Type': 'application/json', ...getCorsHeaders(event) },
    body: JSON.stringify({ message: 'forbidden' }),
});
