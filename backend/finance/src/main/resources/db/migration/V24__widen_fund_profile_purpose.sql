-- V24 (issue #21, item 8): a fund profile's purpose must hold the complete
-- description even when it exceeds 50 words (~300+ characters). Widen the column
-- from VARCHAR(255) to TEXT so long purposes are stored without truncation.
ALTER TABLE donor_fund_profile ALTER COLUMN purpose TYPE TEXT;
