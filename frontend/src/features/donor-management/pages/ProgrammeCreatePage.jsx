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
      <PageHeader title="New programme" subtitle="Add a programme donations and grants can be tied to" />
      <ProgrammeForm
        onSubmit={handleSubmit}
        submitting={createProgramme.isPending}
        submitError={createProgramme.error}
        onCancel={() => navigate('/programmes')}
      />
    </>
  );
}
