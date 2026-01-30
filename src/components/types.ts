export const COMPONENT_OPTIONS = [
    { value: 'ESA', label: 'ESA' },
    { value: 'SQA', label: 'SQA' },
    { value: 'GQT', label: 'GQT' },
    { value: 'PQT', label: 'PQT' },
];

export interface SelectOption {
    label: string;
    value: string;
}

export interface SearchParams {
    ticket: string;
    createdBy: string;
    component: SelectOption | null;
}
