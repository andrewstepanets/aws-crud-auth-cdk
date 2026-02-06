import { Box } from '@radix-ui/themes';
import { Outlet } from 'react-router';
import { useAuth } from '../auth/auth-context';
import { Nav } from './nav';

export function Layout() {
    const { logout } = useAuth();

    return (
        <Box className="App">
            <Nav onSignOut={logout} />
            <Box asChild>
                <main className="main">
                    <Outlet />
                </main>
            </Box>
        </Box>
    );
}
