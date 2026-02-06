import { Box, Button, Flex, Text, TextArea, TextField } from '@radix-ui/themes';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import Select from 'react-select';
import { COMPONENT_OPTIONS } from '../types';
import { ScenarioFormValues } from './types';
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
        <Box className="add-edit-form">
            <Box asChild>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Flex direction="column" gap="4">
                        <Box className="form-group">
                            <Text as="label" htmlFor="ticket" size="2" weight="medium">
                                Ticket
                            </Text>
                            <TextField.Root id="ticket" {...register('ticket')} readOnly={isEdit} />
                            {errors.ticket && (
                                <Text color="red" size="2">
                                    {errors.ticket.message}
                                </Text>
                            )}
                        </Box>
                        <Box className="form-group">
                            <Text as="label" htmlFor="title" size="2" weight="medium">
                                Title
                            </Text>
                            <TextField.Root id="title" {...register('title')} />
                            {errors.title && (
                                <Text color="red" size="2">
                                    {errors.title?.message}
                                </Text>
                            )}
                        </Box>
                        <Box className="form-group">
                            <Text as="label" htmlFor="description" size="2" weight="medium">
                                Description
                            </Text>
                            <TextArea id="description" {...register('description')} rows={4} />
                            {errors.description && (
                                <Text color="red" size="2">
                                    {errors.description?.message}
                                </Text>
                            )}
                        </Box>
                        <Box className="form-group">
                            <Text as="label" size="2" weight="medium">
                                Steps
                            </Text>

                            {fields.map((field, index) => (
                                <Flex key={field.id} gap="2" align="start">
                                    <Flex direction="column" gap="2" style={{ flex: 1 }}>
                                        <TextField.Root
                                            className="steps"
                                            {...register(`steps.${index}.value`)}
                                            placeholder={`Step ${index + 1}`}
                                        />
                                        {errors.steps?.[index]?.value && (
                                            <Text color="red" size="2">
                                                {errors.steps?.[index]?.value?.message}
                                            </Text>
                                        )}
                                    </Flex>

                                    {index > 0 && (
                                        <Button
                                            type="button"
                                            className="addRemove"
                                            onClick={() => remove(index)}
                                            variant="soft"
                                            color="red"
                                        >
                                            Remove
                                        </Button>
                                    )}
                                </Flex>
                            ))}

                            {fields.length < 5 && (
                                <Button
                                    type="button"
                                    className="addRemove"
                                    onClick={() => append({ value: '' })}
                                    variant="soft"
                                >
                                    + Add step
                                </Button>
                            )}
                        </Box>
                        <Box className="form-group">
                            <Text as="label" htmlFor="expectedResult" size="2" weight="medium">
                                Expected result
                            </Text>
                            <TextArea id="expectedResult" {...register('expectedResult')} rows={4} />
                            {errors.expectedResult && (
                                <Text color="red" size="2">
                                    {errors.expectedResult?.message}
                                </Text>
                            )}
                        </Box>
                        <Box className="form-group">
                            <Text as="label" htmlFor="components" size="2" weight="medium">
                                Components
                            </Text>
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
                            {errors.components && (
                                <Text color="red" size="2">
                                    {errors.components?.message}
                                </Text>
                            )}
                        </Box>
                        <Flex gap="3" mt="4">
                            <Button type="submit" className="primary-button" disabled={isPending}>
                                {isEdit ? 'Update' : 'Save'}
                            </Button>
                            <Button type="button" onClick={redirectToMainPage} variant="soft">
                                Cancel
                            </Button>
                        </Flex>
                    </Flex>
                </form>
            </Box>
        </Box>
    );
}
