-- V25 (issue #21, items 6/7/11): demonstrate multiple fund profiles under one
-- donor, each with its own grant agreement. Greenline Power CSR Trust already has
-- a Restricted Class A profile (Clean Air); this adds a second Unrestricted Class C
-- "General" profile with free movement, plus a grant linked to it. The register's
-- committed-funding breakdown then shows both a Restricted and an Unrestricted
-- bucket for the donor. Idempotent: guarded on the new grant code.

DO $$
DECLARE
    v_donor BIGINT; v_prog BIGINT; v_profile BIGINT; v_grant BIGINT;
BEGIN
    SELECT id INTO v_donor FROM donor_master WHERE donor_code = 'DNR-CD-001';

    IF v_donor IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM grant_agreement WHERE grant_code = 'ZRY/GA/2026/001-B'
    ) THEN
        SELECT id INTO v_prog FROM programme WHERE programme_code = 'PRG-CORE';

        -- Fund Profile 2: General · Unrestricted · Class C · Movement: Free.
        -- The purpose intentionally exceeds 50 words to exercise full-text display (item 8).
        INSERT INTO donor_fund_profile (donor_id, fund_mode, fund_class_code, purpose, programme_tied, programme_id, reporting_frequency, admin_allowed, overhead_limit_percent, movement_allowed, explanation_required, onboarding_complete) VALUES (
            v_donor, 'Unrestricted', 'C', 'General organisational support — untied funding available for any programme need at the organisation''s discretion. This longer purpose statement deliberately exceeds fifty words so that the Fund Profiles panel and the individual grant view can be verified to render the complete description, wrapping cleanly across multiple lines without truncation or breaking the surrounding table layout.', false, v_prog, 'Annual', true, NULL, true, false, true) RETURNING id INTO v_profile;
        INSERT INTO donor_geography (fund_profile_id, geography_name) VALUES (v_profile, 'Pan-India (untied)');
        INSERT INTO donor_disbursement_rule (fund_profile_id, rule_type, release_trigger, min_prior_utilisation_required, milestone_required, rule_description) VALUES (
            v_profile, 'Lump-sum / on-receipt', 'Unconditional', NULL, false, 'Untied receipt; recognised on receipt, no conditional release schedule.');

        -- Grant agreement linked to Fund Profile 2 (Unrestricted).
        INSERT INTO grant_agreement (grant_code, donor_id, programme_id, fund_profile_id, agreement_name, agreement_date, start_date, end_date, total_grant_amount, grant_currency, fx_locked_rate, reporting_amount_inr, utilised_amount, grant_status) VALUES (
            'ZRY/GA/2026/001-B', v_donor, v_prog, v_profile, 'Greenline Power CSR Trust: General (Unrestricted) FY26', '2026-04-01', '2026-04-01', '2027-03-31', 4000000.0, 'INR', 1.0, 4000000.0, 1200000.0, 'ACTIVE') RETURNING id INTO v_grant;
        -- Single (final) tranche: utilisation equals the grant's recorded utilised
        -- amount and the period ends at the grant end date, per the V23 conventions.
        INSERT INTO grant_tranche (grant_id, tranche_number, tranche_amount, planned_release_date, actual_amount, actual_release_date, conditions_to_release, prior_utilisation_required, condition_met, tranche_status, utilised_amount, utilisation_end_date) VALUES (
            v_grant, 1, 4000000.0, '2026-04-15', 4000000.0, '2026-04-18', 'Lump-sum on receipt (no gate)', NULL, 'N/A (first/lump)', 'Received', 1200000.0, '2027-03-31');
    END IF;
END $$;
