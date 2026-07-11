-- V21: A "blocked" grant example — an active grant hanging off a DRAFT
-- (not-yet-onboarded) donor. Governance rule: an active grant cannot sit on a
-- non-active donor, so its ₹1.00 Cr commitment is excluded from the funding
-- chain and surfaced separately as "blocked". Mirrors the workbook's pending
-- edge case (Nimbus / PRG-HOLD suspense).
--
-- Idempotent: skipped if the pending donor already exists.

DO $$
DECLARE
    v_donor BIGINT; v_profile BIGINT; v_grant BIGINT;
BEGIN
IF NOT EXISTS (SELECT 1 FROM donor_master WHERE donor_code = 'DNR-CD-014') THEN

    INSERT INTO donor_master (donor_code, donor_name, donor_type, fund_class, email,
        pan_card_number, bank_account_ref, donor_source, fund_source_domicile, fcra_applicable,
        country, status, is_active) VALUES (
        'DNR-CD-014', 'Nimbus Ventures', 'Corporate CSR', 'CORPORATE', 'nimbus.contact@example.org',
        'AAECN1014K', 'DOM-CA-1001', 'CSR', 'Domestic', false, 'India', 'DRAFT', false)
        RETURNING id INTO v_donor;

    -- Pending fund profile: unconfirmed at onboarding (no A/B/C class, held in suspense).
    INSERT INTO donor_fund_profile (donor_id, fund_mode, fund_class_code, purpose, programme_tied,
        programme_id, reporting_frequency, admin_allowed, movement_allowed, explanation_required,
        onboarding_complete) VALUES (
        v_donor, 'Restricted', NULL, 'Unconfirmed at onboarding — funds held in suspense', false,
        NULL, 'Quarterly', true, false, false, false) RETURNING id INTO v_profile;

    -- 'Hold' disbursement rule — disbursement blocked until onboarding completes.
    INSERT INTO donor_disbursement_rule (fund_profile_id, rule_type, release_trigger,
        milestone_required, rule_description) VALUES (
        v_profile, 'Hold', 'Blocked', false,
        'Disbursement blocked until donor onboarding completes (pending donor).');

    -- Active grant on a draft donor → treated as blocked by the dashboard.
    INSERT INTO grant_agreement (grant_code, donor_id, programme_id, fund_profile_id, agreement_name,
        agreement_date, start_date, end_date, total_grant_amount, grant_currency, fx_locked_rate,
        reporting_amount_inr, utilised_amount, grant_status) VALUES (
        'ZRY/GA/2026/014', v_donor, NULL, v_profile, 'Nimbus Ventures - pending onboarding FY26',
        '2026-04-01', '2026-04-01', '2027-03-31', 10000000, 'INR', 1.0, 10000000, 0, 'ACTIVE')
        RETURNING id INTO v_grant;

    -- One expected tranche — blocked, so nothing is received yet.
    INSERT INTO grant_tranche (grant_id, tranche_number, tranche_amount, planned_release_date,
        conditions_to_release, prior_utilisation_required, condition_met, tranche_status) VALUES (
        v_grant, 1, 10000000, '2026-04-15',
        'Release blocked until donor onboarding completes', NULL, 'Pending', 'Expected');
END IF;
END $$;
