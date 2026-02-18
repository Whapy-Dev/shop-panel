import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bannersAPI } from '@/services/api';

export function useMyBannerRequest() {
  return useQuery({
    queryKey: ['my-banner-request'],
    queryFn: () => bannersAPI.getMyRequest(),
    retry: false,
  });
}

export function useRequestBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => bannersAPI.requestBanner(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-banner-request'] }),
  });
}
