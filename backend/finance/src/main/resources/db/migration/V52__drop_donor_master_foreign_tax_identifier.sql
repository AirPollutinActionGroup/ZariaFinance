-- V52: Drop donor_master.foreign_tax_identifier — no longer mapped by the
-- DonorMaster entity. Foreign donors' statutory identity is now captured by
-- the generic document_type/document_number pair (and passport_id) added in
-- V51.

ALTER TABLE donor_master
    DROP COLUMN IF EXISTS foreign_tax_identifier;
