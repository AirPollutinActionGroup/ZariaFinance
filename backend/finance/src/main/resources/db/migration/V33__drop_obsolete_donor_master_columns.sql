-- V30: Drop donor_master columns no longer mapped by the DonorMaster entity.
-- fund_class moved to donor_fund_profile.fund_class_code; the multi-step
-- onboarding status was replaced by the plain is_active flag; the free-text
-- country/foreign_country_name/donor_source/tax_id/bank_account_ref/mou_link
-- fields were superseded by country_id, foreign_country_id, spoc_*, and the
-- other columns added in V29.

ALTER TABLE donor_master
    DROP COLUMN IF EXISTS fund_class,
    DROP COLUMN IF EXISTS status,
    DROP COLUMN IF EXISTS onboarding_step,
    DROP COLUMN IF EXISTS tax_id,
    DROP COLUMN IF EXISTS donor_source,
    DROP COLUMN IF EXISTS foreign_country_name,
    DROP COLUMN IF EXISTS bank_account_ref,
    DROP COLUMN IF EXISTS mou_link,
    DROP COLUMN IF EXISTS country;
