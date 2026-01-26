import { apiService } from './api-service';
import { CreateScenario, GetScenariosResponse, Scenario, UpdateScenario } from './types';

export async function getAllScenarios() {
    return apiService.get<GetScenariosResponse>('scenarios').then(res => res.items);
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
