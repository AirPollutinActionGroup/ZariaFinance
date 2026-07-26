import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../../shared/components/index.js';
import { DonationForm } from '../components/DonationForm.jsx';

export function DonationCreatePage() {
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    console.log('Submitted donation payload:', values);
    navigate('/donations');
  };

  return (
    <>
      <PageHeader
        title="New Donation"
        subtitle="Record a gift received across the organisation."
      />
      <DonationForm onSubmit={handleSubmit} onCancel={() => navigate('/donations')} />
    </>
  );
}
