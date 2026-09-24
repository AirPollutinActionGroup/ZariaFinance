import { useMemo } from 'react';
import { useDesignations } from '../../masters/hooks/useDesignations.js';

/**
 * Org-level "role" designations (CFO, Programme Manager, Head of Organisation,
 * Accounts, CEO, …) — Designation rows with no department, used wherever a
 * disbursement criterion or reminder needs a "who" (verification sign-off,
 * responsible role). Manageable from Master Configuration → Designation,
 * same as any other designation.
 */
export function useRoleDesignations() {
  const designationsQuery = useDesignations();

  const options = useMemo(() => {
    return (designationsQuery.data || [])
      .filter((d) => d.departmentId == null && d.status === 'ACTIVE')
      .map((d) => ({ value: d.id, label: d.name }));
  }, [designationsQuery.data]);

  return { ...designationsQuery, options };
}
