import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketsAPI } from '@/services/api';

export function useMyTickets() {
  return useQuery({
    queryKey: ['tickets'],
    queryFn: () => ticketsAPI.getMyTickets(),
  });
}

export function useCreateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { subject: string; category: string; priority: string; message: string }) =>
      ticketsAPI.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tickets'] }),
  });
}

export function useReplyTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, message }: { id: string; message: string }) =>
      ticketsAPI.reply(id, message),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tickets'] }),
  });
}
