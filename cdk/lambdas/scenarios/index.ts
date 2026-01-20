import { APIGatewayProxyEvent } from 'aws-lambda';
import { create, forbidden, getAll, getById, getUserGroups, isEditor, methodNotAllowed, remove, update } from './utils';

export const handler = async (event: APIGatewayProxyEvent) => {
    const { httpMethod, pathParameters } = event;
    const id = pathParameters?.id;

    const groups = getUserGroups(event);
    const editor = isEditor(groups);

    switch (httpMethod) {
        case 'GET':
            return id ? getById(id) : getAll();
        case 'POST':
            if (!editor) return forbidden();
            return create(event);
        case 'PUT':
            if (!editor) return forbidden();
            return update(id, event);
        case 'DELETE':
            if (!editor) return forbidden();
            return remove(id);
        default:
            return methodNotAllowed();
    }
};
