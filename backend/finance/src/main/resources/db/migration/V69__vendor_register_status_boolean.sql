-- V69: Vendor register status becomes a boolean (true = active, false =
--      inactive) instead of an ACTIVE/INACTIVE varchar, matching the
--      entity's Boolean status field.
ALTER TABLE vendor_register ALTER COLUMN status DROP DEFAULT;
ALTER TABLE vendor_register ALTER COLUMN status TYPE BOOLEAN USING (status = 'ACTIVE');
ALTER TABLE vendor_register ALTER COLUMN status SET DEFAULT true;
