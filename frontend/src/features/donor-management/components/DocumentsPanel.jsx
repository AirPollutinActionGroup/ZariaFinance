import { useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { ACTIONS, PermissionGate } from '../../../core/permissions/index.js';
import {
  ConfirmDialog,
  EmptyState,
  ErrorState,
  LoadingState,
  StatusChip,
} from '../../../shared/components/index.js';
import { formatDateTime } from '../../../lib/format/date.js';
import { useDeleteDocument, useGrantDocuments, useUploadDocument } from '../hooks/useDocuments.js';
import { MODULE_ID } from '../constants.js';
import { DocumentUploadDialog } from './DocumentUploadDialog.jsx';

/** Document register for one grant: list, upload, delete. */
export function DocumentsPanel({ grantId }) {
  const documentsQuery = useGrantDocuments(grantId);
  const uploadMutation = useUploadDocument();
  const deleteMutation = useDeleteDocument();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  const handleUpload = async (values) => {
    await uploadMutation.mutateAsync({ ...values, grantId });
    setUploadOpen(false);
  };

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(pendingDelete.id);
    setPendingDelete(null);
  };

  return (
    <Card>
      <CardContent sx={{ p: 0 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ px: 2.5, pt: 2.5, pb: 1.5 }}
        >
          <Typography variant="h4" component="h2">
            Documents
          </Typography>
          <PermissionGate action={ACTIONS.EDIT} moduleId={MODULE_ID}>
            <Button
              size="small"
              variant="contained"
              startIcon={<UploadFileIcon />}
              onClick={() => setUploadOpen(true)}
            >
              Add document
            </Button>
          </PermissionGate>
        </Stack>

        {documentsQuery.isPending ? (
          <LoadingState label="Loading documents…" />
        ) : documentsQuery.isError ? (
          <ErrorState error={documentsQuery.error} onRetry={documentsQuery.refetch} />
        ) : documentsQuery.data.length === 0 ? (
          <EmptyState
            title="No documents"
            description="Agreements, MOUs and reports attached to this grant will appear here."
          />
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Version</TableCell>
                <TableCell>Uploaded</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documentsQuery.data.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>{doc.documentName}</TableCell>
                  <TableCell>
                    <StatusChip label={doc.documentTypeLabel} tone="outlined" />
                  </TableCell>
                  <TableCell>
                    v{doc.version ?? 1}
                    {doc.isCurrent ? ' · current' : ''}
                  </TableCell>
                  <TableCell>{formatDateTime(doc.uploadDate || doc.createdAt)}</TableCell>
                  <TableCell align="right">
                    <PermissionGate action={ACTIONS.EDIT} moduleId={MODULE_ID}>
                      <IconButton
                        size="small"
                        aria-label={`Delete ${doc.documentName}`}
                        onClick={() => setPendingDelete(doc)}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </PermissionGate>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <DocumentUploadDialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSubmit={handleUpload}
        submitting={uploadMutation.isPending}
        submitError={uploadMutation.error}
      />
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete document"
        description={`Remove "${pendingDelete?.documentName}" from this grant's register? This cannot be undone.`}
        confirmLabel="Delete"
        confirmColor="error"
        busy={deleteMutation.isPending}
        onConfirm={handleDelete}
        onClose={() => setPendingDelete(null)}
      />
    </Card>
  );
}
