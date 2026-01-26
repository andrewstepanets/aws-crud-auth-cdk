import { useNavigate } from 'react-router';
import { useAuth } from '../auth/auth-context';
import { ScenariosTable } from '../components/scenarios-table';

export default function MainPage() {
    const { roles } = useAuth();
    const isEditor = roles.includes('editors');
    const navigate = useNavigate();

    return (
        <>
            <div style={{ height: '24px' }} />
            <div>
                {isEditor && (
                    <>
                        <button className="primary-button" onClick={() => navigate('/add')}>
                            + Add Scenario
                        </button>
                    </>
                )}
            </div>
            <div>
                <ScenariosTable isEditor={isEditor} />
            </div>
        </>
    );
}
