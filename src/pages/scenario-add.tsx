import { useNavigate } from 'react-router';
import { useCreateScenario } from '../api/hooks';
import { AddEditForm } from '../components/add-edit-form.tsx/add-edit-form';
import { ScenarioFormValues } from '../components/add-edit-form.tsx/types';
import { getDefaultValues } from '../components/add-edit-form.tsx/utils';

export default function ScenarioAdd() {
    const navigate = useNavigate();

    const redirectToMainPage = () => {
        navigate('/');
    };

    const defaultValues = getDefaultValues(undefined);

    const { mutate: createScenario, isPending } = useCreateScenario({
        onSuccess: redirectToMainPage,
    });

    const onSubmit = (data: ScenarioFormValues) => {
        createScenario({
            ticket: data.ticket,
            title: data.title,
            description: data.description,
            steps: data.steps.map(step => step.value ?? ''),
            expectedResult: data.expectedResult,
            components: data.components.map(c => c.value),
        });
    };

    return (
        <div className="add">
            <h2>Add scenario</h2>
            <AddEditForm defaultValues={defaultValues} submit={onSubmit} isPending={isPending} />
        </div>
    );
}
