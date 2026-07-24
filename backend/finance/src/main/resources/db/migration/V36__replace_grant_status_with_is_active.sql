ALTER TABLE grant_agreement
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- Preserve the closed/terminated meaning of the old enum before dropping it.
UPDATE grant_agreement
SET is_active = false
WHERE grant_status IN ('CLOSED', 'TERMINATED');

ALTER TABLE grant_agreement
    DROP COLUMN IF EXISTS grant_status;
