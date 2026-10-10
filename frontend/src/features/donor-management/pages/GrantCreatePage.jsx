import { useNavigate } from 'react-router-dom';
import { ErrorState, LoadingState, PageHeader } from '../../../shared/components/index.js';
import { useDonors } from '../hooks/useDonors.js';
import { useCreateGrant } from '../hooks/useGrants.js';
import { GrantForm } from '../components/GrantForm.jsx';

/**
 * /grants/new — records a funding commitment.
 */
export function GrantCreatePage() {
  const navigate = useNavigate();
  const donorsQuery = useDonors('');
  const createGrant = useCreateGrant();

  if (donorsQuery.isPending) return <LoadingState label="Loading grant options…" />;
  if (donorsQuery.isError) {
    return <ErrorState error={donorsQuery.error} onRetry={donorsQuery.refetch} />;
  }

  const handleAgreementSubmit = async (values) => {
    const created = await createGrant.mutateAsync(values);
    navigate(`/grants/${created.id}`, { replace: true });
  };

  return (
    <>
      <PageHeader title="New grant agreement" subtitle="Record a funding commitment" />

      <GrantForm
        donors={donorsQuery.data}
        onSubmit={handleAgreementSubmit}
        submitting={createGrant.isPending}
        submitError={createGrant.error}
        onCancel={() => navigate('/grants')}
        submitLabel="Save grant"
      />
    </>
  );
}
