import { apiService } from './api-service';
import { CreateScenario, GetScenariosResponse, Scenario, SearchParams, UpdateScenario } from './types';

export async function getAllScenarios(params?: SearchParams) {
    const query = new URLSearchParams();

    if (params?.nextKey) query.set('nextKey', params.nextKey);
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.createdBy) query.set('createdBy', params.createdBy);

    return apiService.get<GetScenariosResponse>(`scenarios?${query.toString()}`);
}

export async function getScenarioById(id: string) {
    return apiService.get<Scenario>(`scenarios/${id}`);
}

export async function createScenario(payload: CreateScenario) {
    return apiService.post<Scenario>('scenarios', payload);
}

export async function updateScenario(payload: UpdateScenario) {
    const { id, ...rest } = payload;
    return apiService.put<Scenario>(`scenarios/${id}`, rest);
}

export async function deleteScenario(id: string) {
    return apiService.delete<void>(`scenarios/${id}`);
}
