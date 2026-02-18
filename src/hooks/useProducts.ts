import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsAPI } from '@/services/api';

interface ProductFilters {
  shopId: string;
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  includeInactive?: boolean;
}

export function useProducts(filters: ProductFilters) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () =>
      productsAPI.getByShop(filters.shopId, {
        page: filters.page,
        limit: filters.limit,
        search: filters.search,
        categoryId: filters.categoryId,
        includeInactive: filters.includeInactive,
      }),
    enabled: !!filters.shopId,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ shopId, data }: { shopId: string; data: any }) =>
      productsAPI.create(shopId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      productsAPI.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productsAPI.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
}
