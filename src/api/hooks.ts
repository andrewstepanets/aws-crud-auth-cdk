import { useMutation, UseMutationOptions, useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { createScenario, deleteScenario, getAllScenarios, getScenarioById, updateScenario } from './api';
import { CreateScenario, Scenario, UpdateScenario } from './types';

export const scenariosQueryKeys = {
    all: ['scenarios'] as const,
    oneScenario: (id: string) => ['scenarios', id] as const,
};

export function useGetAllScenarios(options?: UseQueryOptions<Scenario[]>) {
    return useQuery<Scenario[]>({
        queryKey: scenariosQueryKeys.all,
        queryFn: getAllScenarios,
        ...options,
    });
}

export function useGetScenario(id: string, options?: UseQueryOptions<Scenario>) {
    return useQuery<Scenario>({
        queryKey: scenariosQueryKeys.oneScenario(id),
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
