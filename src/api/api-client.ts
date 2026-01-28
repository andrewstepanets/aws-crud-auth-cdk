import axios from 'axios';
import { refreshTokens } from '../auth/auth-service';
import { isTokenExpiring } from '../auth/utils';

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

api.interceptors.request.use(async config => {
    let token = localStorage.getItem('id_token');
    const refreshToken = localStorage.getItem('refresh_token');

    if (token && refreshToken && isTokenExpiring(token)) {
        if (!isRefreshing) {
            isRefreshing = true;
            refreshPromise = refreshTokens(refreshToken)
                .then(tokens => {
                    localStorage.setItem('id_token', tokens.id_token);
                    localStorage.setItem('access_token', tokens.access_token);
                    if (tokens.refresh_token) {
                        localStorage.setItem('refresh_token', tokens.refresh_token);
                    }
                    // generate event for auth provider
                    window.dispatchEvent(new Event('auth_changed'));
                    return tokens.id_token;
                })
                .catch(error => {
                    console.error('Token refresh failed:', error);

                    localStorage.removeItem('id_token');
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');

                    window.dispatchEvent(new Event('auth_changed'));

                    throw error;
                })
                .finally(() => {
                    isRefreshing = false;
                    refreshPromise = null;
                });
        }

        try {
            const newToken = await refreshPromise;
            config.headers.Authorization = `Bearer ${newToken}`;
        } catch {
            return Promise.reject(new axios.Cancel('Token refresh failed'));
        }
    } else if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});
