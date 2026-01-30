import { SelectOption } from '../types';

export interface StepField {
    value?: string;
}

export interface ScenarioFormValues {
    ticket: string;
    title: string;
    description: string;
    steps: StepField[];
    expectedResult: string;
    components: SelectOption[];
}
