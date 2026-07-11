-- V16: Wire grants to fund profiles + add the multi-currency / FX-lock fields
--      (workbook sheets 07 & 08). All additive & nullable — existing grant and
--      tranche rows are unaffected.

-- ── Grant Agreement (sheet 07) ───────────────────────────────────────────────
-- A grant inherits exactly one fund profile; foreign grants lock an FX rate at
-- signing so the INR reporting value is fixed (architecture §6.3 / §6.2).
ALTER TABLE grant_agreement
    ADD COLUMN IF NOT EXISTS fund_profile_id     BIGINT,
    ADD COLUMN IF NOT EXISTS grant_currency      VARCHAR(10) DEFAULT 'INR',
    ADD COLUMN IF NOT EXISTS fx_locked_rate      DECIMAL(12, 4) DEFAULT 1,
    ADD COLUMN IF NOT EXISTS reporting_amount_inr DECIMAL(18, 2);   -- = total_grant_amount × fx_locked_rate

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_grant_fund_profile'
    ) THEN
        ALTER TABLE grant_agreement
            ADD CONSTRAINT fk_grant_fund_profile
            FOREIGN KEY (fund_profile_id) REFERENCES donor_fund_profile(id);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_grant_fund_profile_id ON grant_agreement(fund_profile_id);

-- ── Grant Tranche (sheet 08) ─────────────────────────────────────────────────
-- Existing columns are reused where they align:
--   expected_amount   -> tranche_amount
--   expected_date     -> planned_release_date
--   actual_date       -> actual_release_date
--   release_condition -> conditions_to_release
-- Only the genuinely new fields are added below.
ALTER TABLE grant_tranche
    ADD COLUMN IF NOT EXISTS actual_amount              DECIMAL(18, 2),   -- amount actually received (may differ from expected)
    ADD COLUMN IF NOT EXISTS prior_utilisation_required DECIMAL(5, 2),    -- gate %: release only after this much of prior tranche utilised
    ADD COLUMN IF NOT EXISTS condition_met              VARCHAR(12);      -- 'Met' | 'Pending' | 'N/A (first/lump)'
