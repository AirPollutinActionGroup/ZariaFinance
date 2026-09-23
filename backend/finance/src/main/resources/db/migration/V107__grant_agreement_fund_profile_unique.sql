-- V107: A fund profile backs at most one grant agreement. Multiple NULLs remain
-- allowed (unenforced until a grant is created), but once a profile is attached
-- to a grant it cannot be attached to a second one.

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'uq_grant_fund_profile'
    ) THEN
        ALTER TABLE grant_agreement
            ADD CONSTRAINT uq_grant_fund_profile UNIQUE (fund_profile_id);
    END IF;
END $$;
