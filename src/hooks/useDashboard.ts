import { useQuery } from '@tanstack/react-query';
import { analyticsAPI } from '@/services/api';

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => analyticsAPI.getDashboard(),
  });
}

export function useRevenueTrend(days = 30, groupBy = 'daily') {
  return useQuery({
    queryKey: ['revenue-trend', days, groupBy],
    queryFn: () => analyticsAPI.getRevenueTrend(days, groupBy),
  });
}

export function useTopProducts(limit = 10) {
  return useQuery({
    queryKey: ['top-products', limit],
    queryFn: () => analyticsAPI.getTopProducts(limit),
  });
}
