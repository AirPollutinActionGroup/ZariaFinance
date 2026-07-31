-- V51: Replace donor_master's single PAN field with a generic identity
-- document (type + number) plus a "book" reference, per the redesigned
-- DonorMaster entity — donors are no longer assumed to hold a PAN card;
-- Aadhaar, Voter ID, Driving License, Passport or a foreign tax ID are
-- now equally valid proof of identity.

ALTER TABLE donor_master
    ADD COLUMN IF NOT EXISTS book              VARCHAR(255),
    ADD COLUMN IF NOT EXISTS passport_id       VARCHAR(20),
    ADD COLUMN IF NOT EXISTS document_type     VARCHAR(50),
    ADD COLUMN IF NOT EXISTS document_number   VARCHAR(50);

-- Carry forward any existing PAN as a PAN_CARD identity document so the
-- 10BD "valid ID number on file" check keeps working for existing donors.
UPDATE donor_master
    SET document_type = 'PAN_CARD', document_number = pan_card_number
    WHERE pan_card_number IS NOT NULL AND document_number IS NULL;

ALTER TABLE donor_master
    DROP COLUMN IF EXISTS pan_card_number;
