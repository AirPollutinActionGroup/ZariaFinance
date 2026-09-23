-- V61: Role master gains a user limit — the maximum number of users who may
--      hold a given role. Existing rows are backfilled blank since no limit
--      was previously captured; the column is required for new roles going
--      forward.
ALTER TABLE role_master ADD COLUMN user_limit VARCHAR(50);
UPDATE role_master SET user_limit = '' WHERE user_limit IS NULL;
ALTER TABLE role_master ALTER COLUMN user_limit SET NOT NULL;
