import { APIGatewayProxyEvent } from 'aws-lambda';
import { create, forbidden, getAll, getById, getUserGroups, isEditor, methodNotAllowed, remove, update } from './utils';

export const handler = async (event: APIGatewayProxyEvent) => {
    const { httpMethod, pathParameters } = event;
    const id = pathParameters?.id;

    const groups = getUserGroups(event);
    const editor = isEditor(groups);

    switch (httpMethod) {
        case 'GET':
            return id ? getById(id, event) : getAll(event);
        case 'POST':
            if (!editor) return forbidden(event);
            return create(event);
        case 'PUT':
            if (!editor) return forbidden(event);
            return update(id, event);
        case 'DELETE':
            if (!editor) return forbidden(event);
            return remove(id, event);
        default:
            return methodNotAllowed();
    }
};
