import { useQuery } from '@tanstack/react-query';
import { reviewsAPI } from '@/services/api';

export function useShopReviews(shopId: string) {
  return useQuery({
    queryKey: ['reviews', shopId],
    queryFn: () => reviewsAPI.getByShop(shopId),
    enabled: !!shopId,
  });
}
