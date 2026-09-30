-- V120: An employee allocation may be made against a Program alone — the
--       Project is now optional.
ALTER TABLE employee_allocation ALTER COLUMN project_id DROP NOT NULL;
