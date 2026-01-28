import { APIGatewayProxyEvent } from 'aws-lambda';

process.env.SCENARIOS_TABLE_NAME = 'test-scenarios-table';

import { handler } from '../index';
import * as utils from '../utils';

jest.mock('uuid', () => ({ v4: () => 'mock-uuid-123' }));

describe('Scenarios lambda handler', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        jest.spyOn(utils, 'getUserGroups').mockReturnValue(['editors']);
        jest.spyOn(utils, 'isEditor').mockReturnValue(true);
        jest.spyOn(utils, 'getAll').mockResolvedValue({} as any);
        jest.spyOn(utils, 'getById').mockResolvedValue({} as any);
        jest.spyOn(utils, 'create').mockResolvedValue({} as any);
        jest.spyOn(utils, 'update').mockResolvedValue({} as any);
        jest.spyOn(utils, 'remove').mockResolvedValue({} as any);
        jest.spyOn(utils, 'forbidden').mockReturnValue({} as any);
        jest.spyOn(utils, 'methodNotAllowed').mockReturnValue({} as any);
    });

    const createMockEvent = (httpMethod: string, pathParameters?: { id?: string }): APIGatewayProxyEvent => {
        return {
            httpMethod,
            pathParameters: pathParameters || null,
            requestContext: {
                authorizer: {
                    claims: {
                        email: 'test@example.com',
                        'cognito:groups': ['editors'],
                    },
                },
            },
        } as unknown as APIGatewayProxyEvent;
    };

    describe('GET requests', () => {
        test('should call getAll when no id is provided', async () => {
            const event = createMockEvent('GET');

            await handler(event);

            expect(utils.getAll).toHaveBeenCalledWith(event);
            expect(utils.getById).not.toHaveBeenCalled();
        });

        test('should call getById when id is provided', async () => {
            const event = createMockEvent('GET', { id: 'test-id' });

            await handler(event);

            expect(utils.getById).toHaveBeenCalledWith('test-id', event);
            expect(utils.getAll).not.toHaveBeenCalled();
        });
    });

    describe('POST requests', () => {
        test('should call create when user is editor', async () => {
            const event = createMockEvent('POST');

            await handler(event);

            expect(utils.create).toHaveBeenCalledWith(event);
        });

        test('should return forbidden when user is not editor', async () => {
            const event = createMockEvent('POST');
            jest.spyOn(utils, 'getUserGroups').mockReturnValue(['viewers']);
            jest.spyOn(utils, 'isEditor').mockReturnValue(false);

            await handler(event);

            expect(utils.forbidden).toHaveBeenCalledWith(event);
            expect(utils.create).not.toHaveBeenCalled();
        });
    });

    describe('PUT requests', () => {
        test('should call update when user is editor', async () => {
            const event = createMockEvent('PUT', { id: 'test-id' });

            await handler(event);

            expect(utils.update).toHaveBeenCalledWith('test-id', event);
        });

        test('should return forbidden when user is viewer', async () => {
            const event = createMockEvent('PUT', { id: 'test-id' });
            jest.spyOn(utils, 'getUserGroups').mockReturnValue(['viewers']);
            jest.spyOn(utils, 'isEditor').mockReturnValue(false);

            await handler(event);

            expect(utils.forbidden).toHaveBeenCalledWith(event);
            expect(utils.update).not.toHaveBeenCalled();
        });
    });

    describe('DELETE requests', () => {
        test('should call remove when user is editor', async () => {
            const event = createMockEvent('DELETE', { id: 'test-id' });

            await handler(event);

            expect(utils.remove).toHaveBeenCalledWith('test-id', event);
        });

        test('should return forbidden when user is viewer', async () => {
            const event = createMockEvent('DELETE', { id: 'test-id' });
            jest.spyOn(utils, 'getUserGroups').mockReturnValue(['viewers']);
            jest.spyOn(utils, 'isEditor').mockReturnValue(false);

            await handler(event);

            expect(utils.forbidden).toHaveBeenCalledWith(event);
            expect(utils.remove).not.toHaveBeenCalled();
        });
    });

    describe('Unsupported methods', () => {
        test('should return method not allowed for PATCH', async () => {
            const event = createMockEvent('PATCH');

            await handler(event);

            expect(utils.methodNotAllowed).toHaveBeenCalled();
        });
    });
});
