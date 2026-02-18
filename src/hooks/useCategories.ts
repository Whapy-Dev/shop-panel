import { useQuery } from '@tanstack/react-query';
import { categoriesAPI } from '@/services/api';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesAPI.getAll(),
  });
}
