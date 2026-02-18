import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { analyticsAPI, inventoryAPI } from '../services/api';

export function useStockMovements(params?: {
  type?: string;
  productId?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['stock-movements', params],
    queryFn: () => analyticsAPI.getStockMovements(params),
  });
}

export function useProductStockMovements(productId: string, params?: {
  type?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['product-stock-movements', productId, params],
    queryFn: () => inventoryAPI.getStockMovements(productId, params),
    enabled: !!productId,
  });
}

export function useAdjustStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, data }: { productId: string; data: { quantity: number; notes?: string } }) =>
      inventoryAPI.adjustStock(productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] });
      queryClient.invalidateQueries({ queryKey: ['product-stock-movements'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['low-stock'] });
    },
  });
}

export function useLowStockProducts(threshold?: number) {
  return useQuery({
    queryKey: ['low-stock', threshold],
    queryFn: () => analyticsAPI.getLowStock(threshold),
  });
}

export function useAccountsSummary(from?: string, to?: string) {
  return useQuery({
    queryKey: ['accounts-summary', from, to],
    queryFn: () => analyticsAPI.getAccountsSummary(from, to),
  });
}

export function usePurchaseVsSales(months?: number) {
  return useQuery({
    queryKey: ['purchase-vs-sales', months],
    queryFn: () => analyticsAPI.getPurchaseVsSales(months),
  });
}
