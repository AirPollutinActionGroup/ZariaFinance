import { useNavigate } from 'react-router-dom';
import { ErrorState, LoadingState, PageHeader } from '../../../shared/components/index.js';
import { useDonors } from '../hooks/useDonors.js';
import { useProgrammes } from '../hooks/useProgrammes.js';
import { useCreateGrant } from '../hooks/useGrants.js';
import { GrantForm } from '../components/GrantForm.jsx';

/** /grants/new */
export function GrantCreatePage() {
  const navigate = useNavigate();
  const donorsQuery = useDonors('');
  const programmesQuery = useProgrammes();
  const createGrant = useCreateGrant();

  if (donorsQuery.isPending || programmesQuery.isPending) return <LoadingState label="Loading grant options…" />;
  if (donorsQuery.isError) {
    return <ErrorState error={donorsQuery.error} onRetry={donorsQuery.refetch} />;
  }
  if (programmesQuery.isError) {
    return <ErrorState error={programmesQuery.error} onRetry={programmesQuery.refetch} />;
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
        programmes={programmesQuery.data || []}
        onSubmit={handleSubmit}
        submitting={createGrant.isPending}
        submitError={createGrant.error}
        onCancel={() => navigate('/grants')}
      />
    </>
  );
}
