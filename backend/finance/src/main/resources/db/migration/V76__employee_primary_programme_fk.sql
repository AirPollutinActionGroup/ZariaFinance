-- V76: Employee primary programme becomes an FK into the programme table
--      instead of a free-text code (e.g. "PP1"), consistent with how
--      department/designation were normalised in V75. Only Project-bucket
--      employees carry one, so the column stays nullable.
ALTER TABLE employee ADD COLUMN primary_programme_id BIGINT REFERENCES programme(id);

UPDATE employee e
SET primary_programme_id = p.id
FROM programme p
WHERE p.programme_code = e.primary_programme;

ALTER TABLE employee DROP COLUMN primary_programme;

CREATE INDEX idx_employee_primary_programme_id ON employee(primary_programme_id);
