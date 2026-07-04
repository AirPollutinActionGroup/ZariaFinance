import { useNavigate, useParams } from 'react-router-dom';
import { ErrorState, LoadingState, PageHeader } from '../../../shared/components/index.js';
import { useDonor, useUpdateDonor } from '../hooks/useDonors.js';
import { toDonorFormValues } from '../mappers/donorMapper.js';
import { DonorForm } from '../components/DonorForm.jsx';

/** /donors/:id/edit */
export function DonorEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const donorQuery = useDonor(id);
  const updateDonor = useUpdateDonor(id);

  if (donorQuery.isPending) return <LoadingState label="Loading donor…" />;
  if (donorQuery.isError) return <ErrorState error={donorQuery.error} onRetry={donorQuery.refetch} />;

  const handleSubmit = async (values) => {
    await updateDonor.mutateAsync(values);
    navigate(`/donors/${id}`, { replace: true });
  };

  return (
    <>
      <PageHeader
        title={`Edit ${donorQuery.data.donorName}`}
        subtitle={`Donor ${donorQuery.data.donorCode}`}
      />
      <DonorForm
        mode="edit"
        defaultValues={toDonorFormValues(donorQuery.data)}
        onSubmit={handleSubmit}
        submitting={updateDonor.isPending}
        submitError={updateDonor.error}
        onCancel={() => navigate(`/donors/${id}`)}
      />
    </>
  );
}
