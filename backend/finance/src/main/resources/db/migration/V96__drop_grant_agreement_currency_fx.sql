-- Every grant reports in INR at par — multi-currency / FX-locking on the grant
-- agreement itself was never actually usable from the UI and is now removed.
ALTER TABLE grant_agreement
    DROP COLUMN IF EXISTS grant_currency,
    DROP COLUMN IF EXISTS fx_locked_rate,
    DROP COLUMN IF EXISTS reporting_amount_inr;
