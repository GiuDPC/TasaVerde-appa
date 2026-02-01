import { useQuery } from '@tanstack/react-query';
import { fetchHistory, HistoryResponse } from '../services/api';

export function useHistory(days: number = 7) {
  return useQuery<HistoryResponse>({
    queryKey: ['history', days],
    queryFn: () => fetchHistory(days),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 2,
  });
}
