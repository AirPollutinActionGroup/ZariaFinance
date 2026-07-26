import { useNavigate, useParams } from 'react-router-dom';
import { Button, Stack } from '@mui/material';
import { ErrorState, LoadingState, PageHeader } from '../../../shared/components/index.js';
import { useGrant } from '../hooks/useGrants.js';
import {
  useDisbursement,
  useFinaliseDisbursement,
  usePrefillDisbursement,
  useSaveDisbursement,
} from '../hooks/useDisbursement.js';
import { DisbursementForm } from '../components/DisbursementForm.jsx';

/**
 * /grants/:id/disbursement — the disbursement rules of an existing grant.
 *
 * The same form is step 2 of the new-grant flow; this route is how it is reached
 * later, without walking back through the agreement details.
 */
export function GrantDisbursementPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const grantQuery = useGrant(id);
  const scheduleQuery = useDisbursement(id);
  const save = useSaveDisbursement(id);
  const finalise = useFinaliseDisbursement(id);
  const prefill = usePrefillDisbursement(id);

  if (grantQuery.isPending || scheduleQuery.isPending) {
    return <LoadingState label="Loading disbursement rules…" />;
  }
  if (grantQuery.isError) {
    return <ErrorState error={grantQuery.error} onRetry={grantQuery.refetch} />;
  }
  if (scheduleQuery.isError) {
    return <ErrorState error={scheduleQuery.error} onRetry={scheduleQuery.refetch} />;
  }

  const grant = grantQuery.data;
  const schedule = scheduleQuery.data;

  return (
    <>
      <PageHeader
        title={`Disbursement rules — ${grant.grantCode}`}
        subtitle={`${grant.agreementName} · how this agreement's funds are released`}
        actions={
          <Stack direction="row" spacing={1}>
            <Button color="inherit" onClick={() => navigate(`/grants/${id}`)}>
              Back to grant
            </Button>
          </Stack>
        }
      />
      <DisbursementForm
        schedule={schedule}
        onSubmit={(values) => save.mutateAsync(values)}
        onFinalise={() => finalise.mutate()}
        onPrefill={() => prefill.mutate()}
        saving={save.isPending}
        finalising={finalise.isPending}
        prefilling={prefill.isPending}
        saveError={save.error}
        finaliseError={finalise.error}
        canPrefill={(schedule?.tranches || []).length === 0}
      />
    </>
  );
}
