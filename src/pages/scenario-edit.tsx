import { Box, Heading, Text } from '@radix-ui/themes';
import { useNavigate, useParams } from 'react-router';
import { useGetScenario, useUpdateScenario } from '../api/hooks';
import { AddEditForm } from '../components/add-edit-form.tsx/add-edit-form';
import { ScenarioFormValues } from '../components/add-edit-form.tsx/types';
import { getDefaultValues } from '../components/add-edit-form.tsx/utils';
import { Loader } from '../components/loader';

export default function ScenarioEdit() {
    const navigate = useNavigate();
    const { id } = useParams();

    const redirectToMainPage = () => {
        navigate('/');
    };

    const { data, isLoading, isError } = useGetScenario(id ?? '');

    const defaultValues = getDefaultValues(data);

    const { mutate: updateScenario, isPending } = useUpdateScenario({
        onSuccess: redirectToMainPage,
    });

    if (isLoading) {
        return <Loader />;
    }

    if (isError || !data) {
        return <Text>Scenario not found</Text>;
    }

    const onSubmit = (data: ScenarioFormValues) => {
        updateScenario({
            id: id ?? '',
            ticket: data.ticket,
            title: data.title,
            description: data.description,
            steps: data.steps.map(step => step.value ?? ''),
            expectedResult: data.expectedResult,
            components: data.components.map(c => c.value),
        });
    };

    return (
        <Box className="edit">
            <Heading size="5" mb="4">
                Edit scenario
            </Heading>
            <AddEditForm defaultValues={defaultValues} submit={onSubmit} isPending={isPending} isEdit />
        </Box>
    );
}
