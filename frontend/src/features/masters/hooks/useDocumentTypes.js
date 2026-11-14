import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/query/queryKeys.js';
import { documentTypeService } from '../services/documentTypeService.js';

export function useDocumentTypes(search) {
  return useQuery({
    queryKey: queryKeys.documentTypes.list(search, false),
    queryFn: () => documentTypeService.listDocumentTypes(search),
  });
}

/** Active document types, for the donor form's ID type dropdown. */
export function useActiveDocumentTypes() {
  return useQuery({
    queryKey: queryKeys.documentTypes.list('', true),
    queryFn: () => documentTypeService.listActiveDocumentTypes(),
  });
}

/**
 * code → display name (e.g. PAN_CARD → "PAN Card"), from all document types so
 * a donor holding a since-deactivated type still shows its name. Falls back to
 * the code itself until the list loads.
 */
export function useDocumentTypeName() {
  const { data } = useDocumentTypes();
  return (code) => (code ? data?.find((t) => t.code === code)?.name || code : '');
}

function useInvalidating(mutationFn) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.documentTypes.all() }),
  });
}

export function useCreateDocumentType() {
  return useInvalidating((values) => documentTypeService.createDocumentType(values));
}

export function useUpdateDocumentType() {
  return useInvalidating(({ id, values }) => documentTypeService.updateDocumentType(id, values));
}

/** activate | deactivate with shared invalidation. */
export function useDocumentTypeLifecycle() {
  return useInvalidating(({ id, action }) =>
    action === 'activate'
      ? documentTypeService.activateDocumentType(id)
      : documentTypeService.deactivateDocumentType(id),
  );
}
