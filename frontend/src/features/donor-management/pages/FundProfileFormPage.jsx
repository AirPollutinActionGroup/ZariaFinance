import { useEffect, useState } from 'react';
import { Alert, Box, Button, Stack, Typography } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader, LoadingState, ErrorState } from '../../../shared/components/index.js';
import { useDonor } from '../hooks/useDonors.js';
import {
  useCreateFundProfile,
  useFundProfile,
  useUpdateFundProfile,
} from '../hooks/useFundProfiles.js';
import { fundProfileSchema, fundProfileFormDefaults } from '../validation/fundProfileSchema.js';
import { toFundProfileFormValues } from '../mappers/fundProfileMapper.js';
import { DISBURSEMENT_ERROR_FIELDS, FundProfileFields } from '../components/FundProfileFields.jsx';

/** Create / edit a donor fund profile with its geography and rule collections. */
export function FundProfileFormPage() {
  const { donorId: donorIdParam, id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const profileQuery = useFundProfile(isEdit ? id : null);
  const donorId = isEdit ? profileQuery.data?.donorId : Number(donorIdParam);
  const donorQuery = useDonor(donorId);
  const isForeign = donorQuery.data?.fundSourceDomicile === 'FOREIGN';
  const bookValue = isForeign ? 'FC · Foreign contribution' : 'LC · Local contribution';

  const createMutation = useCreateFundProfile(donorId);
  const updateMutation = useUpdateFundProfile(id, donorId);
  const mutation = isEdit ? updateMutation : createMutation;

  const [disbursementScheduleOpen, setDisbursementScheduleOpen] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(fundProfileSchema),
    defaultValues: fundProfileFormDefaults,
  });

  // Populate the form once the profile loads (edit mode only).
  useEffect(() => {
    if (isEdit && profileQuery.data) {
      reset(toFundProfileFormValues(profileQuery.data));
      if (profileQuery.data.disbursementRules && profileQuery.data.disbursementRules.length > 0) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time UI sync when async profile data first arrives
        setDisbursementScheduleOpen(true);
      }
    }
  }, [isEdit, profileQuery.data, reset]);

  if (isEdit && profileQuery.isPending) return <LoadingState label="Loading fund profile…" />;
  if (isEdit && profileQuery.isError) {
    return <ErrorState error={profileQuery.error} onRetry={profileQuery.refetch} />;
  }

  // Edits return to the profile's own page; a new profile returns to its donor.
  const backTo = isEdit ? `/fund-profiles/${id}` : donorId ? `/donors/${donorId}` : '/fund-profiles';

  const submit = handleSubmit(
    async (values) => {
      await mutation.mutateAsync(values);
      navigate(backTo, { replace: true });
    },
    (formErrors) => {
      // The required fields live inside a collapsible section that starts
      // closed on a new profile — open it so a validation failure there is
      // actually visible instead of silently blocking the submit.
      if (DISBURSEMENT_ERROR_FIELDS.some((field) => formErrors[field])) {
        setDisbursementScheduleOpen(true);
      }
    },
  );

  const errorMessages = Object.values(errors)
    .map((error) => (Array.isArray(error) ? null : error?.message))
    .filter(Boolean)
    .concat(errors.tranches ? ['One or more tranches have missing or invalid fields'] : []);

  return (
    <>
      <PageHeader
        eyebrow={isEdit ? profileQuery.data?.profileCode : 'Code assigned automatically on save'}
        title={isEdit ? 'Edit fund profile' : 'New fund profile'}
        subtitle="How this donor's money may be used — mode, class, movement and reporting rules"
      />

      <Box component="form" onSubmit={submit} noValidate>
        <Stack spacing={3}>
          {mutation.error ? <Alert severity="error">{mutation.error.message}</Alert> : null}
          {errorMessages.length > 0 ? (
            <Alert severity="error">
              <Stack spacing={0.25}>
                {errorMessages.map((message) => (
                  <Typography key={message} variant="body2">
                    {message}
                  </Typography>
                ))}
              </Stack>
            </Alert>
          ) : null}

          <FundProfileFields
            control={control}
            setValue={setValue}
            errors={errors}
            bookValue={bookValue}
            disbursementOpen={disbursementScheduleOpen}
            onDisbursementOpenChange={setDisbursementScheduleOpen}
          />

          <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end' }}>
            <Button color="inherit" onClick={() => navigate(backTo)}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Create profile'}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </>
  );
}
