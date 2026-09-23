-- V66: role_master now declares which frontend permission tier
--      (CEO / FINANCE_OFFICER / FUNDRAISING_LEAD) each custom role maps to,
--      so login can resolve a user's access level from an arbitrary
--      role_master entry rather than a hardcoded string on the account.
ALTER TABLE role_master ADD COLUMN permission_role VARCHAR(30);

UPDATE role_master SET permission_role = 'CEO' WHERE short_name = 'ceo';
UPDATE role_master SET permission_role = 'FINANCE_OFFICER' WHERE short_name = 'cfo';
UPDATE role_master SET permission_role = 'FUNDRAISING_LEAD' WHERE permission_role IS NULL;

ALTER TABLE role_master ALTER COLUMN permission_role SET NOT NULL;
