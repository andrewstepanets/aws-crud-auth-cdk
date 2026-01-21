import { authConfig } from './auth-config';

export function login() {
    const params = new URLSearchParams({
        client_id: authConfig.clientId,
        response_type: 'code',
        scope: authConfig.scopes.join(' '),
        redirect_uri: authConfig.redirectUri,
    });

    window.location.href = `https://${authConfig.domain}/oauth2/authorize?${params.toString()}`;
}

export function logout() {
    const params = new URLSearchParams({
        client_id: authConfig.clientId,
        logout_uri: authConfig.redirectUri,
    });

    window.location.href = `https://${authConfig.domain}/logout?${params.toString()}`;
}

export async function changeCodeForToken(code: string) {
    const body = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: authConfig.clientId,
        code,
        redirect_uri: authConfig.redirectUri,
    });

    const res = await fetch(`https://${authConfig.domain}/oauth2/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
    });

    if (!res.ok) {
        throw new Error('Token exchange failed');
    }

    return res.json();
}
