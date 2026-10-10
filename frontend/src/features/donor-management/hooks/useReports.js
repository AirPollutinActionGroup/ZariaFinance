import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../api/reportsApi.js';

export function useFcraRegister() {
  return useQuery({
    queryKey: ['reports', 'fcra-register'],
    queryFn: () => reportsApi.fcraRegister(),
  });
}
