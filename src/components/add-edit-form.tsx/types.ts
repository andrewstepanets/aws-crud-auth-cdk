export const COMPONENT_OPTIONS = [
    { value: 'ESA', label: 'ESA' },
    { value: 'SQA', label: 'SQA' },
    { value: 'GQT', label: 'GQT' },
];

export interface StepField {
    value?: string;
}

export interface SelectOption {
    label: string;
    value: string;
}
export interface ScenarioFormValues {
    ticket: string;
    title: string;
    description: string;
    steps: StepField[];
    expectedResult: string;
    components: SelectOption[];
}
