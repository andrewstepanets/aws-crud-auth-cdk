import { APIGatewayEvent } from 'aws-lambda';
import { create, getAll, getById, methodNotAllowed, remove, update } from './utils';

export const handler = async (event: APIGatewayEvent) => {
    const { httpMethod, pathParameters } = event;
    const id = pathParameters?.id;

    switch (httpMethod) {
        case 'GET':
            return id ? getById(id) : getAll();
        case 'POST':
            return create(event);
        case 'PUT':
            return update(id, event);
        case 'DELETE':
            return remove(id);
        default:
            return methodNotAllowed();
    }
};
