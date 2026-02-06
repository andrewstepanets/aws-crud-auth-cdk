import { Box, Button, Flex } from '@radix-ui/themes';
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
        <Flex direction="column" gap="4">
            <Box style={{ height: '24px' }} />
            <Box>
                <ScenarioSearchForm
                    onSearch={params =>
                        setSearchParams({
                            createdBy: params.createdBy,
                        })
                    }
                />
            </Box>
            <Box>
                {isEditor && (
                    <Button className="primary-button" onClick={() => navigate('/add')}>
                        + Add Scenario
                    </Button>
                )}
            </Box>
            <Box>
                <ScenariosTable isEditor={isEditor} params={params} />
            </Box>
        </Flex>
    );
}
