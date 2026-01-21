export const authConfig = {
    domain: import.meta.env.VITE_COGNITO_DOMAIN,
    clientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
    redirectUri: window.location.origin,
    scopes: ['openid', 'email', 'profile'],
};
