import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/query/queryKeys.js';
import { documentService } from '../services/documentService.js';

export function useGrantDocuments(grantId, documentName) {
  return useQuery({
    queryKey: queryKeys.documents.byGrant(grantId, documentName),
    queryFn: () => documentService.listByGrant(grantId, documentName),
    enabled: grantId != null,
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formValues) => documentService.uploadDocument(formValues),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.documents.all() }),
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => documentService.deleteDocument(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.documents.all() }),
  });
}
