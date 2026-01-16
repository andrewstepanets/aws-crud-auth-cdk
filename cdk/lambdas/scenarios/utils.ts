import { APIGatewayProxyResult } from 'aws-lambda';

export const getAll = async (): Promise<APIGatewayProxyResult> => ({
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items: [] }),
});

export const getById = async (id?: string): Promise<APIGatewayProxyResult> => {
    return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
    };
};

export const create = async (): Promise<APIGatewayProxyResult> => {
    return {
        statusCode: 201,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'scenario created' }),
    };
};

export const update = async (id?: string): Promise<APIGatewayProxyResult> => {
    return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `scenario ${id} updated` }),
    };
};

export const remove = async (id?: string): Promise<APIGatewayProxyResult> => {
    return {
        statusCode: 204,
        headers: { 'Content-Type': 'application/json' },
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
