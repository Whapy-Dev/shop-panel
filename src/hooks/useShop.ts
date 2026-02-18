import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shopAPI, Shop } from '@/services/api';

export function useMyShop() {
  return useQuery({
    queryKey: ['my-shop'],
    queryFn: () => shopAPI.getMyShop(),
    retry: false,
  });
}

export function useCreateShop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Shop>) => shopAPI.createShop(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-shop'] }),
  });
}

export function useUpdateShop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Shop> }) =>
      shopAPI.updateShop(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-shop'] }),
  });
}

export function useUpdatePromotionalBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      shopAPI.updatePromotionalBanner(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-shop'] }),
  });
}
