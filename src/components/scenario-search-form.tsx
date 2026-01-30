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
        <form onSubmit={handleSubmit(onSearch)} className="scenario-search-form">
            <div style={{ display: 'flex', gap: '8px' }}>
                <div className="form-group">
                    <label htmlFor="title">Created by</label>
                    <input id="title" {...register('createdBy')} />
                </div>
                <button type="submit">Search</button>
                <button type="button" onClick={handleClear}>
                    Clear
                </button>
            </div>
        </form>
    );
}
