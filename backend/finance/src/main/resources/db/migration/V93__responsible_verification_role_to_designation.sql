-- V93: Replace the hardcoded ResponsibleRole / VerificationRole enums with the
--      Designation master — "who" (CFO, Programme Manager, Head of
--      Organisation, Accounts, CEO) is now a manageable designation instead
--      of a fixed Java enum, so a new organisational role can be added
--      without a code change.
--
-- Designation.departmentId becomes optional: these five are org-level roles
-- with no department, alongside the existing department-scoped designations.

ALTER TABLE designation ALTER COLUMN department_id DROP NOT NULL;

INSERT INTO designation (name, department_id, status) VALUES
    ('CEO', NULL, true),
    ('CFO', NULL, true),
    ('Programme Manager', NULL, true),
    ('Head of Organisation', NULL, true),
    ('Accounts', NULL, true);

-- role_directory.role (ResponsibleRole) -> role_directory.designation_id.
ALTER TABLE role_directory ADD COLUMN designation_id BIGINT;

UPDATE role_directory rd
SET designation_id = d.id
FROM designation d
WHERE d.department_id IS NULL
  AND ((rd.role = 'PROGRAMME_MANAGER' AND d.name = 'Programme Manager')
    OR (rd.role = 'CFO' AND d.name = 'CFO')
    OR (rd.role = 'HEAD_OF_ORGANISATION' AND d.name = 'Head of Organisation')
    OR (rd.role = 'ACCOUNTS' AND d.name = 'Accounts'));

ALTER TABLE role_directory ALTER COLUMN designation_id SET NOT NULL;
ALTER TABLE role_directory DROP CONSTRAINT chk_role_directory_role;
ALTER TABLE role_directory DROP COLUMN role;
ALTER TABLE role_directory ADD CONSTRAINT uq_role_directory_designation UNIQUE (designation_id);
ALTER TABLE role_directory ADD CONSTRAINT fk_role_directory_designation
    FOREIGN KEY (designation_id) REFERENCES designation(id);

-- grant_criteria_reminder.responsible_role (ResponsibleRole) -> designation_id.
ALTER TABLE grant_criteria_reminder ADD COLUMN designation_id BIGINT;

UPDATE grant_criteria_reminder gcr
SET designation_id = d.id
FROM designation d
WHERE d.department_id IS NULL
  AND ((gcr.responsible_role = 'PROGRAMME_MANAGER' AND d.name = 'Programme Manager')
    OR (gcr.responsible_role = 'CFO' AND d.name = 'CFO')
    OR (gcr.responsible_role = 'HEAD_OF_ORGANISATION' AND d.name = 'Head of Organisation')
    OR (gcr.responsible_role = 'ACCOUNTS' AND d.name = 'Accounts'));

ALTER TABLE grant_criteria_reminder ALTER COLUMN designation_id SET NOT NULL;
ALTER TABLE grant_criteria_reminder DROP CONSTRAINT chk_reminder_role;
ALTER TABLE grant_criteria_reminder DROP COLUMN responsible_role;
ALTER TABLE grant_criteria_reminder ADD CONSTRAINT fk_reminder_designation
    FOREIGN KEY (designation_id) REFERENCES designation(id);

-- grant_tranche_criteria.verification_role (VerificationRole, milestone sign-off) -> verification_designation_id.
ALTER TABLE grant_tranche_criteria ADD COLUMN verification_designation_id BIGINT;

UPDATE grant_tranche_criteria gtc
SET verification_designation_id = d.id
FROM designation d
WHERE d.department_id IS NULL
  AND ((gtc.verification_role = 'PROGRAMME_MANAGER' AND d.name = 'Programme Manager')
    OR (gtc.verification_role = 'CFO' AND d.name = 'CFO')
    OR (gtc.verification_role = 'HEAD_OF_ORGANISATION' AND d.name = 'Head of Organisation'));

ALTER TABLE grant_tranche_criteria DROP CONSTRAINT chk_criterion_verification_role;
ALTER TABLE grant_tranche_criteria DROP CONSTRAINT chk_criterion_milestone;
ALTER TABLE grant_tranche_criteria DROP COLUMN verification_role;
ALTER TABLE grant_tranche_criteria ADD CONSTRAINT chk_criterion_milestone CHECK (
    criterion_type <> 'MILESTONE_BASED'
    OR (milestone_name IS NOT NULL AND verification_designation_id IS NOT NULL));
ALTER TABLE grant_tranche_criteria ADD CONSTRAINT fk_criteria_verification_designation
    FOREIGN KEY (verification_designation_id) REFERENCES designation(id);

-- donor_release_criteria.verification_sign_off_role / responsible_role (both
-- VerificationRole) -> verification_designation_id / responsible_designation_id.
-- "Other" stays a free-text fallback via the existing other_* columns, now
-- selected by leaving the designation blank rather than a VerificationRole.OTHER
-- sentinel.
ALTER TABLE donor_release_criteria ADD COLUMN verification_designation_id BIGINT;
ALTER TABLE donor_release_criteria ADD COLUMN responsible_designation_id BIGINT;

UPDATE donor_release_criteria drc
SET verification_designation_id = d.id
FROM designation d
WHERE d.department_id IS NULL
  AND ((drc.verification_sign_off_role = 'CEO' AND d.name = 'CEO')
    OR (drc.verification_sign_off_role = 'CFO' AND d.name = 'CFO')
    OR (drc.verification_sign_off_role = 'PROGRAMME_MANAGER' AND d.name = 'Programme Manager')
    OR (drc.verification_sign_off_role = 'HEAD_OF_ORGANISATION' AND d.name = 'Head of Organisation'));

UPDATE donor_release_criteria drc
SET responsible_designation_id = d.id
FROM designation d
WHERE d.department_id IS NULL
  AND ((drc.responsible_role = 'CEO' AND d.name = 'CEO')
    OR (drc.responsible_role = 'CFO' AND d.name = 'CFO')
    OR (drc.responsible_role = 'PROGRAMME_MANAGER' AND d.name = 'Programme Manager')
    OR (drc.responsible_role = 'HEAD_OF_ORGANISATION' AND d.name = 'Head of Organisation'));

ALTER TABLE donor_release_criteria DROP CONSTRAINT chk_release_criteria_verification_role;
ALTER TABLE donor_release_criteria DROP CONSTRAINT chk_release_criteria_responsible_role;
ALTER TABLE donor_release_criteria DROP CONSTRAINT chk_release_criteria_milestone;
ALTER TABLE donor_release_criteria DROP COLUMN verification_sign_off_role;
ALTER TABLE donor_release_criteria DROP COLUMN responsible_role;
ALTER TABLE donor_release_criteria ADD CONSTRAINT chk_release_criteria_milestone CHECK (
    release_criteria <> 'MILESTONE_BASED'
    OR (milestone_name IS NOT NULL AND verification_designation_id IS NOT NULL));
ALTER TABLE donor_release_criteria ADD CONSTRAINT fk_release_criteria_verification_designation
    FOREIGN KEY (verification_designation_id) REFERENCES designation(id);
ALTER TABLE donor_release_criteria ADD CONSTRAINT fk_release_criteria_responsible_designation
    FOREIGN KEY (responsible_designation_id) REFERENCES designation(id);
