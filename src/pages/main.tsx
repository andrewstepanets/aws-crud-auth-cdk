import { useState } from 'react';
import { useNavigate } from 'react-router';
import { SearchParams } from '../api/types';
import { useAuth } from '../auth/auth-context';
import { ScenarioSearchForm } from '../components/scenario-search-form';
import { ScenariosTable } from '../components/scenarios-table';

export default function MainPage() {
    const { roles } = useAuth();
    const isEditor = roles.includes('editors');
    const navigate = useNavigate();

    const [params, setSearchParams] = useState<SearchParams>({ createdBy: undefined });

    return (
        <>
            <div style={{ height: '24px' }} />
            <div>
                <ScenarioSearchForm
                    onSearch={params =>
                        setSearchParams({
                            createdBy: params.createdBy,
                        })
                    }
                />
            </div>
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
                <ScenariosTable isEditor={isEditor} params={params} />
            </div>
        </>
    );
}
