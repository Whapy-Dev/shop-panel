import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersAPI } from '@/services/api';

interface OrderFilters {
  page?: number;
  limit?: number;
  fulfillmentStatus?: string;
  status?: string;
  search?: string;
}

export function useShopOrders(filters: OrderFilters = {}) {
  return useQuery({
    queryKey: ['shop-orders', filters],
    queryFn: () => ordersAPI.getShopOrders(filters),
  });
}

export function useShopOrderDetail(orderId: string) {
  return useQuery({
    queryKey: ['shop-order', orderId],
    queryFn: () => ordersAPI.getShopOrderDetail(orderId),
    enabled: !!orderId,
  });
}

export function useUpdateFulfillment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, fulfillmentStatus }: { orderId: string; fulfillmentStatus: string }) =>
      ordersAPI.updateFulfillment(orderId, fulfillmentStatus),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['shop-orders'] });
      qc.invalidateQueries({ queryKey: ['shop-order'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
