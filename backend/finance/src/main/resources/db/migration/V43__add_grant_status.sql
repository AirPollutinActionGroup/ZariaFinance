-- V43: Grant agreement status — the Section 1 "Status" dropdown on the New Grant
--      Agreement Form (Active / Completed / Cancelled).
--
-- V36 dropped the old grant_status enum in favour of is_active, but the form
-- needs a status the user can SET, not one derived after the fact. grant_status
-- is now the field of record; is_active stays as the boolean every existing
-- query, report and lifecycle endpoint already reads, kept in lockstep by
-- GrantServiceImpl.applyStatus (ACTIVE ⇔ is_active = true).

ALTER TABLE grant_agreement
    ADD COLUMN IF NOT EXISTS grant_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE';

-- Backfill from the two flags that carried this meaning until now.
-- is_approved: 1 = approved, 2 = pending, 3 = on hold, 4 = completed.
UPDATE grant_agreement SET grant_status = 'COMPLETED' WHERE is_approved = 4;
UPDATE grant_agreement SET grant_status = 'CANCELLED' WHERE is_active = false AND is_approved <> 4;

ALTER TABLE grant_agreement
    ADD CONSTRAINT chk_grant_status CHECK (grant_status IN ('ACTIVE', 'COMPLETED', 'CANCELLED'));

CREATE INDEX IF NOT EXISTS idx_grant_status ON grant_agreement(grant_status);
