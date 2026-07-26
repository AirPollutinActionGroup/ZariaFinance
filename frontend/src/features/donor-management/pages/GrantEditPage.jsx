import { useNavigate, useParams } from 'react-router-dom';
import { ErrorState, LoadingState, PageHeader } from '../../../shared/components/index.js';
import { useDonors } from '../hooks/useDonors.js';
import { useGrant, useUpdateGrant } from '../hooks/useGrants.js';
import { grantService } from '../services/grantService.js';
import { GrantForm } from '../components/GrantForm.jsx';

/** /grants/:id/edit */
export function GrantEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const donorsQuery = useDonors('');
  const grantQuery = useGrant(id);
  const updateGrant = useUpdateGrant(id);

  if (donorsQuery.isPending || grantQuery.isPending) {
    return <LoadingState label="Loading grant…" />;
  }
  if (grantQuery.isError) {
    return <ErrorState error={grantQuery.error} onRetry={grantQuery.refetch} />;
  }
  if (donorsQuery.isError) {
    return <ErrorState error={donorsQuery.error} onRetry={donorsQuery.refetch} />;
  }

  const grant = grantQuery.data;

  const handleSubmit = async (values) => {
    await updateGrant.mutateAsync(values);
    navigate(`/grants/${id}`, { replace: true });
  };

  return (
    <>
      <PageHeader title={`Edit ${grant.grantCode}`} subtitle={grant.agreementName} />
      <GrantForm
        donors={donorsQuery.data}
        defaultValues={grantService.toFormValues(grant)}
        onSubmit={handleSubmit}
        submitting={updateGrant.isPending}
        submitError={updateGrant.error}
        onCancel={() => navigate(`/grants/${id}`)}
        submitLabel="Save changes"
      />
    </>
  );
}
