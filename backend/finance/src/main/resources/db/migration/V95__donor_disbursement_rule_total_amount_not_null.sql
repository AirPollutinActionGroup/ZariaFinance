-- V95: total_amount is now mandatory at the API layer (CreateFundProfileRequest
--      and FundProfileValidator) — enforce it at the DB layer too. Safe: no
--      existing donor_disbursement_rule row has a null total_amount.
ALTER TABLE donor_disbursement_rule ALTER COLUMN total_amount SET NOT NULL;
