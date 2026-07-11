-- V13: Extend donor_master with the FCRA / domicile / statutory-identity fields
--      introduced by the "Donor Module Master Workbook" (sheets 02 & 10).
--
-- All columns are nullable / defaulted so existing donor rows are unaffected.
-- NOTE: `fund_source_domicile` (Domestic/Foreign) is the trigger for FCRA
-- treatment, FX handling and FC-4 reporting per the architecture doc §12.4.

ALTER TABLE donor_master
    ADD COLUMN IF NOT EXISTS donor_source             VARCHAR(50),        -- CSR / Individual / Sponsorship / Untied-UC …
    ADD COLUMN IF NOT EXISTS fund_source_domicile      VARCHAR(20),        -- 'Domestic' | 'Foreign'
    ADD COLUMN IF NOT EXISTS fcra_applicable           BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS foreign_fund_source_type  VARCHAR(50),        -- 'Foreign - Government' | 'Foreign - Private' | 'Domestic / NA'
    ADD COLUMN IF NOT EXISTS foreign_country_name      VARCHAR(100),
    ADD COLUMN IF NOT EXISTS pan_card_number           VARCHAR(20),        -- statutory identifier for 80G / TDS / audit
    ADD COLUMN IF NOT EXISTS bank_account_ref          VARCHAR(100),       -- FCRA-DESIG-… for foreign, DOM-CA-… for domestic
    ADD COLUMN IF NOT EXISTS mou_link                  VARCHAR(500);

CREATE INDEX IF NOT EXISTS idx_donor_domicile ON donor_master(fund_source_domicile);
CREATE INDEX IF NOT EXISTS idx_donor_fcra ON donor_master(fcra_applicable);
