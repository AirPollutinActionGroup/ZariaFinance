import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../../shared/components/index.js';
import { useCreateDonor } from '../hooks/useDonors.js';
import { DonorForm } from '../components/DonorForm.jsx';

/** /donors/new */
export function DonorCreatePage() {
  const navigate = useNavigate();
  const createDonor = useCreateDonor();

  const handleSubmit = async (values) => {
    const donor = await createDonor.mutateAsync(values);
    navigate(`/donors/${donor.id}`, { replace: true });
  };

  return (
    <>
      <PageHeader title="New donor" subtitle="Register a funding source" />
      <DonorForm
        mode="create"
        onSubmit={handleSubmit}
        submitting={createDonor.isPending}
        submitError={createDonor.error}
        onCancel={() => navigate('/donors')}
      />
    </>
  );
}
