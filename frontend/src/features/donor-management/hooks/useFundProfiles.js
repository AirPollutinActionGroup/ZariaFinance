import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/query/queryKeys.js';
import { fundProfileService } from '../services/fundProfileService.js';

export function useFundProfilesByDonor(donorId) {
  return useQuery({
    queryKey: queryKeys.fundProfiles.byDonor(donorId),
    queryFn: () => fundProfileService.listByDonor(donorId),
    enabled: donorId != null,
  });
}

export function useFundProfile(id) {
  return useQuery({
    queryKey: queryKeys.fundProfiles.detail(id),
    queryFn: () => fundProfileService.getProfile(id),
    enabled: id != null,
  });
}

export function useCreateFundProfile(donorId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formValues) => fundProfileService.createProfile(donorId, formValues),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.fundProfiles.byDonor(donorId) }),
  });
}

export function useUpdateFundProfile(id, donorId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formValues) => fundProfileService.updateProfile(id, formValues),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.fundProfiles.all() });
      if (donorId != null) {
        queryClient.invalidateQueries({ queryKey: queryKeys.fundProfiles.byDonor(donorId) });
      }
    },
  });
}
