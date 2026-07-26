import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Step, StepLabel, Stepper, Stack } from '@mui/material';
import { ErrorState, LoadingState, PageHeader } from '../../../shared/components/index.js';
import { useDonors } from '../hooks/useDonors.js';
import { useCreateGrant } from '../hooks/useGrants.js';
import {
  useDisbursement,
  useFinaliseDisbursement,
  usePrefillDisbursement,
  useSaveDisbursement,
} from '../hooks/useDisbursement.js';
import { GrantForm } from '../components/GrantForm.jsx';
import { DisbursementForm } from '../components/DisbursementForm.jsx';

const STEPS = ['Agreement details', 'Disbursement rules'];

/**
 * /grants/new — two steps in one flow.
 *
 * Step 1 saves the grant, which mints its code and fixes the committed total;
 * step 2 configures how that total is released. The disbursement spec requires
 * the agreement to exist first, and the schedule needs a grant id to attach to.
 *
 * Abandoning at step 2 leaves a grant with no schedule, which is a valid state —
 * a schedule is optional until it is finalised.
 */
export function GrantCreatePage() {
  const navigate = useNavigate();
  const donorsQuery = useDonors('');
  const createGrant = useCreateGrant();
  const [grant, setGrant] = useState(null);

  const grantId = grant?.id ?? null;
  const scheduleQuery = useDisbursement(grantId);
  const saveSchedule = useSaveDisbursement(grantId);
  const finalise = useFinaliseDisbursement(grantId);
  const prefill = usePrefillDisbursement(grantId);

  if (donorsQuery.isPending) return <LoadingState label="Loading grant options…" />;
  if (donorsQuery.isError) {
    return <ErrorState error={donorsQuery.error} onRetry={donorsQuery.refetch} />;
  }

  const step = grant ? 1 : 0;

  const handleAgreementSubmit = async (values) => {
    const created = await createGrant.mutateAsync(values);
    setGrant(created);
  };

  const finish = () => navigate(`/grants/${grantId}`, { replace: true });

  return (
    <>
      <PageHeader
        title="New grant agreement"
        subtitle={
          grant
            ? `${grant.grantCode} saved — now set out how the funds are released`
            : 'Record a funding commitment'
        }
        actions={
          grant ? (
            <Button variant="outlined" onClick={finish}>
              Finish later
            </Button>
          ) : null
        }
      />

      <Stack spacing={3}>
        <Stepper activeStep={step} sx={{ maxWidth: 520 }}>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {step === 0 ? (
          <GrantForm
            donors={donorsQuery.data}
            onSubmit={handleAgreementSubmit}
            submitting={createGrant.isPending}
            submitError={createGrant.error}
            onCancel={() => navigate('/grants')}
            submitLabel="Save & continue"
          />
        ) : (
          <>
            <Alert severity="success">
              {grant.grantCode} created. Its disbursement rules can also be edited later from the grant
              page.
            </Alert>
            {scheduleQuery.isPending ? (
              <LoadingState label="Preparing disbursement rules…" />
            ) : scheduleQuery.isError ? (
              <ErrorState error={scheduleQuery.error} onRetry={scheduleQuery.refetch} />
            ) : (
              <DisbursementForm
                schedule={scheduleQuery.data}
                onSubmit={(values) => saveSchedule.mutateAsync(values)}
                onFinalise={() => finalise.mutate(undefined, { onSuccess: finish })}
                onPrefill={() => prefill.mutate()}
                saving={saveSchedule.isPending}
                finalising={finalise.isPending}
                prefilling={prefill.isPending}
                saveError={saveSchedule.error}
                finaliseError={finalise.error}
                canPrefill={(scheduleQuery.data?.tranches || []).length === 0}
              />
            )}
          </>
        )}
      </Stack>
    </>
  );
}
