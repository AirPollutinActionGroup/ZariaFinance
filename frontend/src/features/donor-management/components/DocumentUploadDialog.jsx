import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RhfSelect, RhfTextField } from '../../../shared/components/index.js';
import { applyServerErrors } from '../../../lib/forms/applyServerErrors.js';
import { documentSchema, documentFormDefaults } from '../validation/documentSchema.js';
import { DOCUMENT_TYPE, toOptions } from '../constants.js';

/**
 * Metadata-based document registration, mirroring UploadDocumentRequest.
 * (The backend accepts a document path, not file bytes — gap #6.)
 */
export function DocumentUploadDialog({ open, onClose, onSubmit, submitting, submitError }) {
  const { control, handleSubmit, reset, setError } = useForm({
    resolver: zodResolver(documentSchema),
    defaultValues: documentFormDefaults,
  });

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values);
      reset(documentFormDefaults);
    } catch (error) {
      applyServerErrors(error, setError);
    }
  });

  const handleClose = () => {
    reset(documentFormDefaults);
    onClose();
  };

  return (
    <Dialog open={open} onClose={submitting ? undefined : handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add document</DialogTitle>
      <DialogContent>
        <Stack spacing={1} sx={{ mt: 1 }}>
          {submitError && !submitError.fieldErrors ? (
            <Alert severity="error">{submitError.message}</Alert>
          ) : null}
          <RhfTextField name="documentName" control={control} label="Document name" required />
          <RhfSelect
            name="documentType"
            control={control}
            label="Document type"
            required
            options={toOptions(DOCUMENT_TYPE)}
          />
          <RhfTextField
            name="documentPath"
            control={control}
            label="Document path / URL"
            helperText="Location of the stored file (binary upload endpoint pending — gap #6)"
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button color="inherit" onClick={handleClose} disabled={submitting}>
          Cancel
        </Button>
        <Button variant="contained" onClick={submit} disabled={submitting}>
          {submitting ? 'Saving…' : 'Add document'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
