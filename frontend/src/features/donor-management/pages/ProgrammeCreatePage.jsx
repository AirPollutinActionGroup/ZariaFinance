import { Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageHeader } from '../../../shared/components/index.js';
import { useCreateProgramme } from '../hooks/useProgrammes.js';
import { ProgrammeForm } from '../components/ProgrammeForm.jsx';
import { programmeFormDefaults } from '../validation/programmeSchema.js';

/** /programmes/new */
export function ProgrammeCreatePage() {
  const navigate = useNavigate();
  const createProgramme = useCreateProgramme();
  // "Add project" on a programme's page links here with ?parent=<id>.
  const parentId = useSearchParams()[0].get('parent');
  const defaultValues = parentId
    ? { ...programmeFormDefaults, type: 'Project', parentProgrammeId: parentId }
    : undefined;

  const handleSubmit = async (values) => {
    const programme = await createProgramme.mutateAsync(values);
    navigate(`/programmes/${programme.id}`, { replace: true });
  };

  return (
    <>
      <PageHeader
        title={parentId ? 'New Project' : 'New Programme or Project'}
        subtitle="Fill in the details below; the code is assigned when you save."
        actions={
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/programmes')}>
            Back to List
          </Button>
        }
      />
      <ProgrammeForm
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        submitting={createProgramme.isPending}
        submitError={createProgramme.error}
        onCancel={() => navigate('/programmes')}
      />
    </>
  );
}
