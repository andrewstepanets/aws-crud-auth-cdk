import { jwtDecode, JwtPayload } from 'jwt-decode';

export interface TokenPayload extends JwtPayload {
    'cognito:groups': string[];
    exp: number;
}

export function isTokenValid(token: string, bufferMinutes = 2) {
    const payload = jwtDecode<TokenPayload>(token);

    if (!payload.exp) {
        return false;
    }

    const expirationTime = payload.exp * 1000;
    const bufferTime = bufferMinutes * 60 * 1000;

    return expirationTime > Date.now() + bufferTime;
}

export function isTokenExpiring(token: string) {
    const { exp } = jwtDecode<TokenPayload>(token);
    return exp * 1000 - Date.now() < 30000;
}
