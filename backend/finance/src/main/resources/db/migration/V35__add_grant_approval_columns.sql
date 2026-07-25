ALTER TABLE grant_agreement
    ADD COLUMN IF NOT EXISTS approved_by VARCHAR(255),
    ADD COLUMN IF NOT EXISTS approval_remarks TEXT,
    ADD COLUMN IF NOT EXISTS is_approved INTEGER NOT NULL DEFAULT 2, -- 1 = approved, 2 = pending, 3 = on hold, 4 = completed
    ADD COLUMN IF NOT EXISTS approval_date TIMESTAMP;
