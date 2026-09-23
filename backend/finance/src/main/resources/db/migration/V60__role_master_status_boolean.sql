-- V60: Role master status becomes a boolean (true = active, false = inactive)
--      instead of an ACTIVE/INACTIVE varchar, matching the entity's Boolean
--      status field.
ALTER TABLE role_master ALTER COLUMN status DROP DEFAULT;
ALTER TABLE role_master ALTER COLUMN status TYPE BOOLEAN USING (status = 'ACTIVE');
ALTER TABLE role_master ALTER COLUMN status SET DEFAULT true;
