import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionsAPI } from '@/services/api';

export function useMySubscription() {
  return useQuery({
    queryKey: ['subscription'],
    queryFn: () => subscriptionsAPI.getMe(),
    retry: false,
  });
}

export function useSubscriptionPlans() {
  return useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const res = await subscriptionsAPI.getPlans();
      // Backend devuelve { plans: [...] }, extraer el array
      return Array.isArray(res) ? res : (res as any).plans ?? [];
    },
  });
}

export function useCreateSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { plan: string; billingCycle: string }) =>
      subscriptionsAPI.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subscription'] }),
  });
}

export function useSubscriptionHistory() {
  return useQuery({
    queryKey: ['subscription-history'],
    queryFn: () => subscriptionsAPI.getHistory(),
  });
}

export function useCancelSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => subscriptionsAPI.cancel(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['subscription'] }),
  });
}
