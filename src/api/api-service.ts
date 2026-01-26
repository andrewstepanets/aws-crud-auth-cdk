import { getAuthToken } from '../auth/token-provider';

interface RequestOptions {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    url: string;
    body?: unknown;
}

async function request<T>({ method, url, body }: RequestOptions): Promise<T> {
    const token = getAuthToken();

    const res = await fetch(`${import.meta.env.VITE_API_URL}/${url}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
        throw new Error(`API error ${res.status}`);
    }

    if (res.status === 204) {
        return undefined as T;
    }

    return res.json();
}

export const apiService = {
    get: <T>(url: string) => request<T>({ method: 'GET', url }),
    post: <T>(url: string, body: unknown) => request<T>({ method: 'POST', url, body }),
    put: <T>(url: string, body: unknown) => request<T>({ method: 'PUT', url, body }),
    delete: <T>(url: string) => request<T>({ method: 'DELETE', url }),
};
