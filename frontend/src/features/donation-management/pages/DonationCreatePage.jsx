import { useNavigate } from 'react-router-dom';
import { ErrorState, LoadingState, PageHeader } from '../../../shared/components/index.js';
import { useDonors } from '../../donor-management/hooks/useDonors.js';
import { useProgrammes } from '../../donor-management/hooks/useProgrammes.js';
import { useCreateDonation } from '../hooks/useDonations.js';
import { DonationForm } from '../components/DonationForm.jsx';

/** /donations/new */
export function DonationCreatePage() {
  const navigate = useNavigate();
  const donorsQuery = useDonors('');
  const programmesQuery = useProgrammes();
  const createDonation = useCreateDonation();

  const loading = donorsQuery.isPending || programmesQuery.isPending;
  const firstError = donorsQuery.error || programmesQuery.error;

  if (loading) return <LoadingState label="Loading donation form options…" />;
  if (firstError) {
    return (
      <ErrorState
        error={firstError}
        onRetry={() => {
          donorsQuery.refetch();
          programmesQuery.refetch();
        }}
      />
    );
  }

  const handleSubmit = async (values) => {
    const donation = await createDonation.mutateAsync(values);
    navigate(`/donations/${donation.id}`, { replace: true });
  };

  return (
    <>
      <PageHeader title="New donation" subtitle="Record a gift received" />
      <DonationForm
        donors={donorsQuery.data}
        programmes={programmesQuery.data}
        onSubmit={handleSubmit}
        submitting={createDonation.isPending}
        submitError={createDonation.error}
        onCancel={() => navigate('/donations')}
      />
    </>
  );
}
