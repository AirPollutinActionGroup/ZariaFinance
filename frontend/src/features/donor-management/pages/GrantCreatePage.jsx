import { useNavigate } from 'react-router-dom';
import { ErrorState, LoadingState, PageHeader } from '../../../shared/components/index.js';
import { useDonors } from '../hooks/useDonors.js';
import { useCreateGrant } from '../hooks/useGrants.js';
import { GrantForm } from '../components/GrantForm.jsx';

/** /grants/new */
export function GrantCreatePage() {
  const navigate = useNavigate();
  const donorsQuery = useDonors('');
  const createGrant = useCreateGrant();

  if (donorsQuery.isPending) return <LoadingState label="Loading donors…" />;
  if (donorsQuery.isError) {
    return <ErrorState error={donorsQuery.error} onRetry={donorsQuery.refetch} />;
  }

  const handleSubmit = async (values) => {
    const grant = await createGrant.mutateAsync(values);
    navigate(`/grants/${grant.id}`, { replace: true });
  };

  return (
    <>
      <PageHeader title="New grant agreement" subtitle="Record a funding commitment" />
      <GrantForm
        donors={donorsQuery.data}
        onSubmit={handleSubmit}
        submitting={createGrant.isPending}
        submitError={createGrant.error}
        onCancel={() => navigate('/grants')}
      />
    </>
  );
}
