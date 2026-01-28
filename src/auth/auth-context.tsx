import { jwtDecode } from 'jwt-decode';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { changeCodeForToken, login, logout } from './auth-service';
import { TokenPayload } from './utils';

interface AuthState {
    idToken: string | null;
    roles: string[];
    logout: () => void;
}

interface AuthProviderProps {
    children: React.ReactNode;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: AuthProviderProps) {
    const [idToken, setIdToken] = useState<string | null>(localStorage.getItem('id_token'));
    const [roles, setRoles] = useState<string[]>(() => {
        const token = localStorage.getItem('id_token');
        if (token) {
            const payload = jwtDecode<TokenPayload>(token);
            return payload['cognito:groups'] ?? [];
        }
        return [];
    });

    const authCodeConsumedRef = useRef(false);
    const isLoggingOut = useRef(false);

    useEffect(() => {
        const syncAuth = () => {
            const token = localStorage.getItem('id_token');
            setIdToken(token);

            if (token) {
                const payload = jwtDecode<TokenPayload>(token);
                setRoles(payload['cognito:groups'] ?? []);
            } else {
                setRoles([]);
            }
        };

        window.addEventListener('auth_changed', syncAuth);
        window.addEventListener('storage', syncAuth);

        return () => {
            window.removeEventListener('auth_changed', syncAuth);
            window.removeEventListener('storage', syncAuth);
        };
    }, []);

    useEffect(() => {
        if (isLoggingOut.current) {
            return;
        }

        if (idToken) {
            return;
        }

        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');

        if (code && !authCodeConsumedRef.current) {
            authCodeConsumedRef.current = true;

            changeCodeForToken(code).then(tokens => {
                setIdToken(tokens.id_token);

                const payload = jwtDecode<TokenPayload>(tokens.id_token);
                setRoles(payload['cognito:groups'] ?? []);

                localStorage.setItem('id_token', tokens.id_token);
                localStorage.setItem('access_token', tokens.access_token);
                localStorage.setItem('refresh_token', tokens.refresh_token);

                window.history.replaceState({}, '', window.location.pathname);
            });

            return;
        }

        if (!code && !localStorage.getItem('id_token')) {
            login();
        }
    }, [idToken]);

    function handleLogout() {
        isLoggingOut.current = true;
        setIdToken(null);
        setRoles([]);

        localStorage.removeItem('id_token');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');

        logout();
    }

    return (
        <AuthContext.Provider
            value={{
                idToken,
                roles,
                logout: handleLogout,
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
