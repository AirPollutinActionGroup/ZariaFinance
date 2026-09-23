-- V75: Employee department/designation become FK references into the
--      masters department/designation tables instead of free-text strings.
--      A few employee records used a (designation, department) pairing that
--      the designation master never had (the two seed sets were authored
--      independently) — those combinations are inserted into designation so
--      every employee ends up pointing at a designation that genuinely
--      belongs to its own department, rather than silently losing the row.
ALTER TABLE employee ADD COLUMN department_id BIGINT REFERENCES department(id);
ALTER TABLE employee ADD COLUMN designation_id BIGINT REFERENCES designation(id);

UPDATE employee e
SET department_id = d.id
FROM department d
WHERE d.name = e.department;

INSERT INTO designation (name, department_id, status)
SELECT DISTINCT e.designation, e.department_id, true
FROM employee e
WHERE NOT EXISTS (
    SELECT 1 FROM designation g
    WHERE g.name = e.designation AND g.department_id = e.department_id
);

UPDATE employee e
SET designation_id = g.id
FROM designation g
WHERE g.name = e.designation AND g.department_id = e.department_id;

ALTER TABLE employee ALTER COLUMN department_id SET NOT NULL;
ALTER TABLE employee ALTER COLUMN designation_id SET NOT NULL;

DROP INDEX IF EXISTS idx_employee_department;
ALTER TABLE employee DROP COLUMN department;
ALTER TABLE employee DROP COLUMN designation;

CREATE INDEX idx_employee_department_id ON employee(department_id);
CREATE INDEX idx_employee_designation_id ON employee(designation_id);
