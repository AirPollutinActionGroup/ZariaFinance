import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/query/queryKeys.js';
import { organisationService } from '../services/organisationService.js';

export function useOrganisations(search) {
  return useQuery({
    queryKey: queryKeys.organisations.list(search),
    queryFn: () => organisationService.listOrganisations(search),
  });
}

export function useOrganisation(id) {
  return useQuery({
    queryKey: queryKeys.organisations.detail(id),
    queryFn: () => organisationService.getOrganisation(id),
    enabled: id != null,
  });
}

/** On-demand short-name availability check, triggered by the verify icon. */
export function useVerifyShortName() {
  return useMutation({
    mutationFn: (shortName) => organisationService.isShortNameAvailable(shortName),
  });
}

export function useCreateOrganisation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formValues) => organisationService.createOrganisation(formValues),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.organisations.all() }),
  });
}

/** activate | deactivate with shared invalidation. */
export function useOrganisationLifecycle(id) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (action) =>
      action === 'activate'
        ? organisationService.activateOrganisation(id)
        : organisationService.deactivateOrganisation(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.organisations.all() }),
  });
}
