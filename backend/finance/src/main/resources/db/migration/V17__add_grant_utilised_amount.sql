-- V17: Seeded "utilised" placeholder on grants.
--
-- The workbook has no expenditure/actuals data, so utilisation is not real. Per
-- the agreed design (received = real tranche receipts; utilised = illustrative
-- until an actuals/expenditure module exists) this column holds a seeded,
-- clearly-labelled placeholder that the dashboard funding chain reads for the
-- "Utilised" stage. Replace with a real utilisation source when one ships.

ALTER TABLE grant_agreement
    ADD COLUMN IF NOT EXISTS utilised_amount DECIMAL(18, 2) DEFAULT 0;
