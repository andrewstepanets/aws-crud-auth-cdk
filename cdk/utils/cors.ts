import { APIGatewayEvent } from 'aws-lambda';

const LOCALHOST_ORIGINS = ['http://localhost:3000'];

export const withCors = (event?: APIGatewayEvent): Record<string, string> => {
    const origin = event?.headers?.origin;

    if (origin && LOCALHOST_ORIGINS.includes(origin)) {
        return {
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Credentials': 'true',
        };
    }

    return {};
};
