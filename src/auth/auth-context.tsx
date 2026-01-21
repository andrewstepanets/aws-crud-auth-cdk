import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { changeCodeForToken, login, logout } from './auth-service';

interface AuthState {
    accessToken: string | null;
    roles: string[];
    logout: () => void;
}

interface AuthProviderProps {
    children: React.ReactNode;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: AuthProviderProps) {
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [roles, setRoles] = useState<string[]>([]);

    const authCodeConsumedRef = useRef(false); // to avoid two code change

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');

        if (accessToken) {
            return;
        }

        if (code && !authCodeConsumedRef.current) {
            authCodeConsumedRef.current = true;

            changeCodeForToken(code).then(tokens => {
                setAccessToken(tokens.access_token);

                const payload = JSON.parse(atob(tokens.id_token.split('.')[1]));

                setRoles(payload['cognito:groups'] ?? []);

                window.history.replaceState({}, '', window.location.pathname);
            });

            return;
        }

        if (!code) {
            login();
        }
    }, [accessToken]);

    return (
        <AuthContext.Provider
            value={{
                accessToken,
                roles,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthState {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth must be used inside AuthProvider');
    }
    return ctx;
}
