-- V78: Employee gains Joining Date (mandatory) and Exit Date (set once the
--      employee leaves), and status becomes a lifecycle string instead of a
--      plain boolean — Active / On Notice / Inactive – Resigned /
--      Inactive – Terminated / Inactive – Contract Ended. Existing inactive
--      rows have no recorded reason, so they backfill to "Inactive –
--      Resigned" as the most common case; correct manually if known
--      otherwise. Joining date backfills to the row's created_at since the
--      real date was never captured.
ALTER TABLE employee ADD COLUMN joining_date DATE;
ALTER TABLE employee ADD COLUMN exit_date DATE;

UPDATE employee SET joining_date = created_at::date WHERE joining_date IS NULL;

ALTER TABLE employee ALTER COLUMN joining_date SET NOT NULL;

ALTER TABLE employee ALTER COLUMN status DROP DEFAULT;
ALTER TABLE employee ALTER COLUMN status TYPE VARCHAR(30)
    USING (CASE WHEN status THEN 'Active' ELSE 'Inactive – Resigned' END);
ALTER TABLE employee ALTER COLUMN status SET DEFAULT 'Active';

ALTER TABLE employee ADD CONSTRAINT chk_employee_status CHECK (
    status IN ('Active', 'On Notice', 'Inactive – Resigned', 'Inactive – Terminated', 'Inactive – Contract Ended')
);
