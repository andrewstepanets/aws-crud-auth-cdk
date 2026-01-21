import { useAuth } from './auth/auth-context';
import { Nav } from './components/nav';
import { MainPage } from './pages/main';

function App() {
    const { accessToken, roles, logout } = useAuth();

    if (!accessToken) {
        return <div>Loading...</div>;
    }

    const isEditor = roles.includes('editors');

    return (
        <div className="App">
            <Nav onSignOut={logout} />
            <MainPage isEditor={isEditor} />
        </div>
    );
}

export default App;
