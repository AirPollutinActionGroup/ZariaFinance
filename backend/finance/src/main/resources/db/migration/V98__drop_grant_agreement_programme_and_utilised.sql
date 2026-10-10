-- A grant no longer carries its own programme association — programme is
-- purely a fund-profile-level concept (donor_fund_profile.programme_id).
-- Also drops utilised_amount, the seeded illustrative placeholder that fed
-- the now-removed dashboard "Utilised"/"Available" figures and the
-- Utilisation Compliance report.
ALTER TABLE grant_agreement
    DROP COLUMN IF EXISTS programme_id,
    DROP COLUMN IF EXISTS utilised_amount;
