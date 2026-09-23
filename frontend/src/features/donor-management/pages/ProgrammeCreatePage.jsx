import { Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../../shared/components/index.js';
import { useCreateProgramme } from '../hooks/useProgrammes.js';
import { ProgrammeForm } from '../components/ProgrammeForm.jsx';

/** /programmes/new */
export function ProgrammeCreatePage() {
  const navigate = useNavigate();
  const createProgramme = useCreateProgramme();

  const handleSubmit = async (values) => {
    const programme = await createProgramme.mutateAsync(values);
    navigate(`/programmes/${programme.id}`, { replace: true });
  };

  return (
    <>
      <PageHeader
        title="Add a programme or project"
        subtitle="Programmes are the parent record; projects sit underneath one and need a parent programme."
        actions={
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/programmes')}>
            Back to List
          </Button>
        }
      />
      <ProgrammeForm
        onSubmit={handleSubmit}
        submitting={createProgramme.isPending}
        submitError={createProgramme.error}
        onCancel={() => navigate('/programmes')}
      />
    </>
  );
}
