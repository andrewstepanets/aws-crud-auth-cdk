import { useAuth } from './auth/auth-context';
import { Loader } from './components/loader';
import { AppRoutes } from './routes/app-routes';

function App() {
    const { accessToken } = useAuth();

    if (!accessToken) {
        return <Loader />;
    }

    return <AppRoutes />;
}

export default App;
