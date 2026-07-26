import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/query/queryKeys.js';
import { donationService } from '../services/donationService.js';

export function useDonations(filters) {
  return useQuery({
    queryKey: queryKeys.donations.list(filters),
    queryFn: () => donationService.listDonations(filters),
  });
}

export function useDonation(id) {
  return useQuery({
    queryKey: queryKeys.donations.detail(id),
    queryFn: () => donationService.getDonation(id),
    enabled: id != null,
  });
}

export function useCreateDonation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formValues) => donationService.createDonation(formValues),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.donations.all() }),
  });
}

export function useUpdateDonation(id) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formValues) => donationService.updateDonation(id, formValues),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.donations.all() }),
  });
}

export function useUpdateGikIntendedUse(donationId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ gikItemId, intendedUse, reason }) =>
      donationService.updateGikIntendedUse(donationId, gikItemId, { intendedUse, reason }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.donations.detail(donationId) }),
  });
}

export function useIssueEightyGReceipt(id) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => donationService.issueEightyGReceipt(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.donations.all() }),
  });
}

export function useMarkTenBdFiling(id) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => donationService.markTenBdFiling(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.donations.all() }),
  });
}
