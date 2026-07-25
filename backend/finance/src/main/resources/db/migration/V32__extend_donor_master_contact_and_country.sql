-- V29: Reconcile donor_master with the redesigned DonorMaster entity —
-- adds SPOC contact fields, a proper foreign-tax identifier, and a real
-- country_id FK (replacing the free-text `country` column going forward).
-- fund_class moved to donor_fund_profile; the donor-level column is legacy
-- and must stop being required so new inserts (which no longer set it) work.

ALTER TABLE donor_master
    ADD COLUMN IF NOT EXISTS foreign_tax_identifier   VARCHAR(100),
    ADD COLUMN IF NOT EXISTS spoc_name_of_the_person   VARCHAR(255),
    ADD COLUMN IF NOT EXISTS spoc_phone_number         VARCHAR(255),
    ADD COLUMN IF NOT EXISTS spoc_email                VARCHAR(255),
    ADD COLUMN IF NOT EXISTS address2                  TEXT,
    ADD COLUMN IF NOT EXISTS foreign_country_id        VARCHAR(100),
    ADD COLUMN IF NOT EXISTS country_id                BIGINT;

ALTER TABLE donor_master ADD CONSTRAINT fk_donor_country FOREIGN KEY (country_id) REFERENCES country_master(id);
CREATE INDEX IF NOT EXISTS idx_donor_country_id ON donor_master(country_id);

ALTER TABLE donor_master ALTER COLUMN fund_class DROP NOT NULL;

-- Existing rows stored donor_type / fund_source_domicile as free-text labels;
-- the entity now reads them as @Enumerated(STRING) constant names.
UPDATE donor_master SET donor_type = 'CORPORATE' WHERE donor_type IN ('Corporate CSR', 'Corporate Sponsor');
UPDATE donor_master SET donor_type = 'INDIVIDUAL' WHERE donor_type = 'Individual';
UPDATE donor_master SET donor_type = 'FOUNDATION' WHERE donor_type = 'Foundation';
UPDATE donor_master SET donor_type = 'GOVERNMENT' WHERE donor_type = 'Government';
UPDATE donor_master SET donor_type = 'CORPORATE' WHERE donor_type NOT IN ('CORPORATE', 'INDIVIDUAL', 'FOUNDATION', 'GOVERNMENT');

UPDATE donor_master SET fund_source_domicile = 'DOMESTIC' WHERE fund_source_domicile = 'Domestic';
UPDATE donor_master SET fund_source_domicile = 'FOREIGN' WHERE fund_source_domicile = 'Foreign';

-- Backfill the new required SPOC fields and the country FK for pre-existing rows.
UPDATE donor_master SET spoc_name_of_the_person = donor_name WHERE spoc_name_of_the_person IS NULL;
UPDATE donor_master SET spoc_email = email WHERE spoc_email IS NULL;
UPDATE donor_master SET foreign_country_id = foreign_country_name WHERE foreign_country_id IS NULL;
UPDATE donor_master d SET country_id = c.id
    FROM country_master c
    WHERE d.country_id IS NULL AND c.country_name = d.country;

ALTER TABLE donor_master
    ALTER COLUMN spoc_name_of_the_person SET NOT NULL,
    ALTER COLUMN spoc_email SET NOT NULL;
