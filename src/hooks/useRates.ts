import { useQuery } from '@tanstack/react-query';
import { fetchAllRates, Rates } from '../services/api';

export function useRates() {
  return useQuery<Rates>({
    queryKey: ['rates'],
    queryFn: fetchAllRates,
    refetchInterval: 60 * 1000,
    staleTime: 30 * 1000,
    retry: 3,
  });
}
