import { useMutation, UseMutationOptions, useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import {
    createScenario,
    deleteScenario,
    getAllScenarios,
    getScenarioAudit,
    getScenarioById,
    updateScenario,
} from './api';
import { CreateScenario, GetScenariosResponse, Scenario, ScenarioAudit, SearchParams, UpdateScenario } from './types';

export const scenariosQueryKeys = {
    all: ['scenarios'] as const,
    scenario: (id: string) => ['scenarios', id] as const,
    audit: (id: string) => ['scenarios', id, 'audit'] as const,
};

export function useGetAllScenarios(params?: SearchParams, options?: UseQueryOptions<GetScenariosResponse>) {
    return useQuery<GetScenariosResponse>({
        queryKey: ['scenarios', params],
        queryFn: () => getAllScenarios({ ...params, limit: 5 }),
        placeholderData: previousData => previousData,
        ...options,
    });
}

export function useGetScenario(id: string, options?: UseQueryOptions<Scenario>) {
    return useQuery<Scenario>({
        queryKey: scenariosQueryKeys.scenario(id),
        queryFn: () => getScenarioById(id),
        enabled: !!id,
        ...options,
    });
}

export function useCreateScenario(options?: UseMutationOptions<Scenario, Error, CreateScenario>) {
    const queryClient = useQueryClient();

    return useMutation<Scenario, Error, CreateScenario>({
        mutationFn: createScenario,
        ...options,
        onSuccess: (...rest) => {
            queryClient.invalidateQueries({
                queryKey: scenariosQueryKeys.all,
            });

            options?.onSuccess?.(...rest);
        },
    });
}

export function useUpdateScenario(options?: UseMutationOptions<Scenario, Error, UpdateScenario>) {
    const queryClient = useQueryClient();

    return useMutation<Scenario, Error, UpdateScenario>({
        mutationFn: updateScenario,
        ...options,
        onSuccess: (...rest) => {
            queryClient.invalidateQueries({
                queryKey: scenariosQueryKeys.all,
            });

            options?.onSuccess?.(...rest);
        },
    });
}

export function useDeleteScenario(options?: UseMutationOptions<void, Error, string>) {
    const queryClient = useQueryClient();

    return useMutation<void, Error, string>({
        mutationFn: deleteScenario,
        ...options,
        onSuccess: (...rest) => {
            queryClient.invalidateQueries({
                queryKey: scenariosQueryKeys.all,
            });

            options?.onSuccess?.(...rest);
        },
    });
}

export function useGetScenarioAudit(id: string, options?: UseQueryOptions<ScenarioAudit>) {
    return useQuery<ScenarioAudit>({
        queryKey: scenariosQueryKeys.audit(id),
        queryFn: () => getScenarioAudit(id),
        enabled: !!id,
        ...options,
    });
}
