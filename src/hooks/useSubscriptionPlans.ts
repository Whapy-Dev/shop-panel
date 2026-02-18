import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionPlansAdminAPI, SubscriptionPlanAdmin } from '@/services/api';

export function useSubscriptionPlans() {
  return useQuery({
    queryKey: ['subscription-plans-admin'],
    queryFn: () => subscriptionPlansAdminAPI.getAll(),
  });
}

export function useCreateSubscriptionPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<SubscriptionPlanAdmin>) =>
      subscriptionPlansAdminAPI.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subscription-plans-admin'] }),
  });
}

export function useUpdateSubscriptionPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SubscriptionPlanAdmin> }) =>
      subscriptionPlansAdminAPI.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subscription-plans-admin'] }),
  });
}

export function useDeleteSubscriptionPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => subscriptionPlansAdminAPI.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subscription-plans-admin'] }),
  });
}

export function useSeedSubscriptionPlans() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => subscriptionPlansAdminAPI.seed(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subscription-plans-admin'] }),
  });
}
