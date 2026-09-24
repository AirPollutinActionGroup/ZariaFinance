-- V101: Drop the donation-intake fields that the Donation entity no longer
-- carries (receipt date/channel/book/identification/anonymous detail,
-- currency/FX/bank & voucher references, other_programme) and widen
-- fund_class_code into fund_class so it can hold the full FundClass enum
-- name rather than a single letter.
DROP INDEX IF EXISTS idx_donation_book;
DROP INDEX IF EXISTS idx_donation_receipt_date;
DROP INDEX IF EXISTS idx_donation_identification;

ALTER TABLE donation
    DROP COLUMN receipt_date,
    DROP COLUMN channel,
    DROP COLUMN book,
    DROP COLUMN identification,
    DROP COLUMN anonymous_collection_source,
    DROP COLUMN anonymous_source_reference,
    DROP COLUMN other_programme,
    DROP COLUMN currency,
    DROP COLUMN fx_rate,
    DROP COLUMN reporting_amount_inr,
    DROP COLUMN bank_account_type,
    DROP COLUMN transaction_ref,
    DROP COLUMN tally_voucher_ref;

ALTER TABLE donation
    ALTER COLUMN fund_class_code TYPE VARCHAR(30);

ALTER TABLE donation
    RENAME COLUMN fund_class_code TO fund_class;
