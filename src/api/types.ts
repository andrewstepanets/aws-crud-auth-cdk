export interface RequestOptions {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    url: string;
    body?: unknown;
}

export interface Scenario {
    id: string;
    ticket: string;
    title: string;
    description: string;
    steps: string[];
    expectedResult: string;
    components: string[];
    createdBy: string;
    createdAt: string;
}

export interface CreateScenario {
    ticket: string;
    title: string;
    description: string;
    steps: string[];
    expectedResult: string;
    components: string[];
}

export interface UpdateScenario {
    id: string;
    ticket: string;
    title: string;
    description: string;
    steps: string[];
    expectedResult: string;
    components: string[];
}

export interface GetScenariosResponse {
    items: Scenario[];
    nextKey?: string;
}

export interface SearchParams {
    nextKey?: string;
    limit?: number;
    createdBy?: string;
}
