import { Box, Button, Flex, Text, TextField } from '@radix-ui/themes';
import { useForm } from 'react-hook-form';
import { SearchParams } from './types';

export interface SearchFormProps {
    onSearch: (params: SearchParams) => void;
}

export function ScenarioSearchForm({ onSearch }: SearchFormProps) {
    const { register, handleSubmit, reset } = useForm<SearchParams>({
        defaultValues: {
            createdBy: '',
        },
    });

    const handleClear = () => {
        reset();
    };

    return (
        <Box asChild>
            <form onSubmit={handleSubmit(onSearch)} className="scenario-search-form">
                <Flex gap="3">
                    <Box className="form-group">
                        <Text as="label" htmlFor="title" size="2" weight="medium">
                            Created by
                        </Text>
                        <TextField.Root id="title" {...register('createdBy')} />
                    </Box>
                    <Button type="submit">Search</Button>
                    <Button type="button" onClick={handleClear} variant="soft">
                        Clear
                    </Button>
                </Flex>
            </form>
        </Box>
    );
}
