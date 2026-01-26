import { Outlet } from 'react-router';
import { useAuth } from '../auth/auth-context';
import { Nav } from './nav';

export function Layout() {
    const { logout } = useAuth();

    return (
        <div className="App">
            <Nav onSignOut={logout} />
            <main className="main">
                <Outlet />
            </main>
        </div>
    );
}
