import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import Select from 'react-select';
import { COMPONENT_OPTIONS, ScenarioFormValues } from './types';
import { scenarioSchema } from './validation';

export interface AddEditFormProps {
    defaultValues: ScenarioFormValues;
    submit: (values: ScenarioFormValues) => void;
    isPending: boolean;
    isEdit?: boolean;
}

export function AddEditForm({ defaultValues, submit, isPending, isEdit }: AddEditFormProps) {
    const navigate = useNavigate();
    const redirectToMainPage = () => {
        navigate('/');
    };
    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<ScenarioFormValues>({
        resolver: yupResolver(scenarioSchema),
        mode: 'onTouched',
        defaultValues,
    });
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'steps',
    });

    const onSubmit = (values: ScenarioFormValues) => {
        submit(values);
    };

    return (
        <div className="add-edit-form">
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="form-group">
                    <label htmlFor="ticket">Ticket</label>
                    <input id="ticket" {...register('ticket')} readOnly={isEdit} />
                    {errors.ticket && <span className="error">{errors.ticket.message}</span>}
                </div>
                <div className="form-group">
                    <label htmlFor="title">Title</label>
                    <input id="title" {...register('title')} />
                    {errors.title && <span className="error">{errors.title?.message}</span>}
                </div>
                <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea id="description" {...register('description')} rows={4} />
                    {errors.description && <span className="error">{errors.description?.message}</span>}
                </div>
                <div className="form-group">
                    <label>Steps</label>

                    {fields.map((field, index) => (
                        <div key={field.id} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <input
                                    className="steps"
                                    {...register(`steps.${index}.value`)}
                                    placeholder={`Step ${index + 1}`}
                                />
                                {errors.steps?.[index]?.value && (
                                    <span className="error">{errors.steps?.[index]?.value?.message}</span>
                                )}
                            </div>

                            {index > 0 && (
                                <button type="button" className="addRemove" onClick={() => remove(index)}>
                                    Remove
                                </button>
                            )}
                        </div>
                    ))}

                    {fields.length < 5 && (
                        <button type="button" className="addRemove" onClick={() => append({ value: '' })}>
                            + Add step
                        </button>
                    )}
                </div>
                <div className="form-group">
                    <label htmlFor="expectedResult">Expected result</label>
                    <textarea id="expectedResult" {...register('expectedResult')} rows={4} />
                    {errors.expectedResult && <span className="error">{errors.expectedResult?.message}</span>}
                </div>
                <div className="form-group">
                    <label htmlFor="components">Components</label>
                    <Controller
                        control={control}
                        name="components"
                        render={({ field }) => (
                            <Select
                                inputId="components"
                                {...field}
                                isMulti
                                options={COMPONENT_OPTIONS}
                                onChange={field.onChange}
                            />
                        )}
                    />
                    {errors.components && <span className="error">{errors.components?.message}</span>}
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                    <button type="submit" className="primary-button" disabled={isPending}>
                        {isEdit ? 'Update' : 'Save'}
                    </button>
                    <button type="button" onClick={redirectToMainPage}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
