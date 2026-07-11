ALTER TABLE users
    ADD COLUMN IF NOT EXISTS approved_by BIGINT,
    ADD COLUMN IF NOT EXISTS is_approved INTEGER NOT NULL DEFAULT 2; -- 1 = approved, 2 = pending, 3 = rejected
