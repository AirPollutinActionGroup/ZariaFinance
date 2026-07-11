-- V20: Full 'Donor Module Master Workbook' seed (generated from the workbook CSVs).
-- Keyed on donor name so the sheets join correctly despite the workbook's FK drift.
-- Idempotent: the whole block is skipped if the workbook donors already exist.

-- Widen condition_met: the workbook uses "N/A (first/lump)" (16 chars) > VARCHAR(12).
ALTER TABLE grant_tranche ALTER COLUMN condition_met TYPE VARCHAR(20);

DO $$
DECLARE
    v_prog BIGINT; v_donor BIGINT; v_profile BIGINT; v_grant BIGINT; v_received NUMERIC;
BEGIN
IF NOT EXISTS (SELECT 1 FROM donor_master WHERE donor_code = 'DNR-CD-001') THEN

    INSERT INTO programme (programme_code, programme_name, description, is_active) VALUES ('PRG-CLEANAIR', 'Clean Air Action Programme', 'Air-quality monitoring, policy advocacy and community action across priority airsheds.', true) ON CONFLICT (programme_code) DO NOTHING;
    INSERT INTO programme (programme_code, programme_name, description, is_active) VALUES ('PRG-ISF', 'India Science Festival', 'Annual flagship festival, promoting public engagement with science.', true) ON CONFLICT (programme_code) DO NOTHING;
    INSERT INTO programme (programme_code, programme_name, description, is_active) VALUES ('PRG-ISBF', 'India Science Book Fellowship', 'Fellowship funding authorship and publication of popular-science books.', true) ON CONFLICT (programme_code) DO NOTHING;
    INSERT INTO programme (programme_code, programme_name, description, is_active) VALUES ('PRG-WATER', 'Urban Water & Sanitation', 'WASH infrastructure and behaviour-change programming in urban wards.', true) ON CONFLICT (programme_code) DO NOTHING;
    INSERT INTO programme (programme_code, programme_name, description, is_active) VALUES ('PRG-EDU', 'Education & Livelihoods', 'School-readiness and youth livelihood interventions.', true) ON CONFLICT (programme_code) DO NOTHING;
    INSERT INTO programme (programme_code, programme_name, description, is_active) VALUES ('PRG-CORE', 'Organisational Core / Unrestricted Pool', 'Holding programme for untied funds available for any organisational need.', true) ON CONFLICT (programme_code) DO NOTHING;

    -- ===== Greenline Power CSR Trust =====
    INSERT INTO donor_master (donor_code, donor_name, donor_type, fund_class, email, pan_card_number, bank_account_ref, donor_source, fund_source_domicile, fcra_applicable, foreign_fund_source_type, foreign_country_name, country, status, is_active) VALUES (
        'DNR-CD-001', 'Greenline Power CSR Trust', 'Corporate CSR', 'CORPORATE', 'greenline.contact@example.org', 'AAECG1001K', 'DOM-CA-1001', 'CSR', 'Domestic', false, 'Domestic / NA', NULL, 'India', 'ACTIVE', true) RETURNING id INTO v_donor;
    SELECT id INTO v_prog FROM programme WHERE programme_code = 'PRG-CLEANAIR';
    INSERT INTO donor_fund_profile (donor_id, fund_mode, fund_class_code, purpose, programme_tied, programme_id, reporting_frequency, admin_allowed, overhead_limit_percent, movement_allowed, explanation_required, onboarding_complete) VALUES (
        v_donor, 'Restricted', 'A', 'Clean Air Action (defined project only)', false, v_prog, 'Quarterly', true, 5.0, false, false, true) RETURNING id INTO v_profile;
    INSERT INTO donor_geography (fund_profile_id, geography_name) VALUES (v_profile, 'Delhi NCR');
    INSERT INTO donor_geography (fund_profile_id, geography_name) VALUES (v_profile, 'Uttar Pradesh');
    INSERT INTO donor_utilisation_rule (fund_profile_id, rule_type, limit_percentage, description) VALUES (v_profile, 'Admin / Overhead cap', 5.0, 'Admin overhead recovery capped at 5% of grant value (per agreement).');
    INSERT INTO donor_utilisation_rule (fund_profile_id, rule_type, limit_percentage, description) VALUES (v_profile, 'Fundraising cost exclusion', 0.0, 'Grant may not be applied to fundraising / resource-mobilisation cost lines.');
    INSERT INTO donor_disbursement_rule (fund_profile_id, rule_type, release_trigger, min_prior_utilisation_required, milestone_required, rule_description) VALUES (v_profile, 'Tranche-on-UC', 'Milestone + utilisation gate', 75.0, true, 'Next tranche released only after (a) at least 75% of the prior tranche is utilised AND (b) the agreed programme milestone / utilisation certificate for the period is accepted by the donor.');
    INSERT INTO grant_agreement (grant_code, donor_id, programme_id, fund_profile_id, agreement_name, agreement_date, start_date, end_date, total_grant_amount, grant_currency, fx_locked_rate, reporting_amount_inr, utilised_amount, grant_status) VALUES (
        'ZRY/GA/2026/001', v_donor, v_prog, v_profile, 'Greenline Power CSR Trust: PRG-CLEANAIR FY26', '2026-04-01', '2026-04-01', '2027-03-31', 5000000.0, 'INR', 1.0, 5000000.0, 2166666.67, 'ACTIVE') RETURNING id INTO v_grant;
    INSERT INTO grant_tranche (grant_id, tranche_number, tranche_amount, planned_release_date, actual_amount, actual_release_date, conditions_to_release, prior_utilisation_required, condition_met, tranche_status) VALUES (
        v_grant, 1, 1666666.67, '2026-04-15', 1666666.67, '2026-04-18', 'Advance on signed agreement', NULL, 'N/A (first/lump)', 'Received');
    INSERT INTO grant_tranche (grant_id, tranche_number, tranche_amount, planned_release_date, actual_amount, actual_release_date, conditions_to_release, prior_utilisation_required, condition_met, tranche_status) VALUES (
        v_grant, 2, 1666666.67, '2026-07-15', 1666666.67, '2026-07-20', '≥75% of Tranche 1 utilised + programme milestone / UC accepted', 75.0, 'Met', 'Received');
    INSERT INTO grant_tranche (grant_id, tranche_number, tranche_amount, planned_release_date, actual_amount, actual_release_date, conditions_to_release, prior_utilisation_required, condition_met, tranche_status) VALUES (
        v_grant, 3, 1666666.67, '2026-10-15', NULL, NULL, '≥75% of Tranche 2 utilised + programme milestone / UC accepted', 75.0, 'Pending', 'Expected');

    -- ===== Mehta Cement CSR Foundation =====
    INSERT INTO donor_master (donor_code, donor_name, donor_type, fund_class, email, pan_card_number, bank_account_ref, donor_source, fund_source_domicile, fcra_applicable, foreign_fund_source_type, foreign_country_name, country, status, is_active) VALUES (
        'DNR-CD-002', 'Mehta Cement CSR Foundation', 'Corporate CSR', 'CORPORATE', 'mehta.contact@example.org', 'AAECG1002K', 'DOM-CA-1001', 'CSR', 'Domestic', false, 'Domestic / NA', NULL, 'India', 'ACTIVE', true) RETURNING id INTO v_donor;
    SELECT id INTO v_prog FROM programme WHERE programme_code = 'PRG-WATER';
    INSERT INTO donor_fund_profile (donor_id, fund_mode, fund_class_code, purpose, programme_tied, programme_id, reporting_frequency, admin_allowed, overhead_limit_percent, movement_allowed, explanation_required, onboarding_complete) VALUES (
        v_donor, 'Restricted', 'A', 'Urban Water & Sanitation (defined project)', false, v_prog, 'Quarterly', true, 5.0, false, false, true) RETURNING id INTO v_profile;
    INSERT INTO donor_geography (fund_profile_id, geography_name) VALUES (v_profile, 'Maharashtra');
    INSERT INTO donor_utilisation_rule (fund_profile_id, rule_type, limit_percentage, description) VALUES (v_profile, 'Admin / Overhead cap', 5.0, 'Admin overhead recovery capped at 5% of grant value (per agreement).');
    INSERT INTO donor_utilisation_rule (fund_profile_id, rule_type, limit_percentage, description) VALUES (v_profile, 'Fundraising cost exclusion', 0.0, 'Grant may not be applied to fundraising / resource-mobilisation cost lines.');
    INSERT INTO donor_disbursement_rule (fund_profile_id, rule_type, release_trigger, min_prior_utilisation_required, milestone_required, rule_description) VALUES (v_profile, 'Tranche-on-UC', 'Milestone + utilisation gate', 75.0, true, 'Next tranche released only after (a) at least 75% of the prior tranche is utilised AND (b) the agreed programme milestone / utilisation certificate for the period is accepted by the donor.');
    INSERT INTO grant_agreement (grant_code, donor_id, programme_id, fund_profile_id, agreement_name, agreement_date, start_date, end_date, total_grant_amount, grant_currency, fx_locked_rate, reporting_amount_inr, utilised_amount, grant_status) VALUES (
        'ZRY/GA/2026/002', v_donor, v_prog, v_profile, 'Mehta Cement CSR Foundation: PRG-WATER FY26', '2026-04-01', '2026-04-01', '2027-03-31', 3000000.0, 'INR', 1.0, 3000000.0, 1300000.0, 'ACTIVE') RETURNING id INTO v_grant;
    INSERT INTO grant_tranche (grant_id, tranche_number, tranche_amount, planned_release_date, actual_amount, actual_release_date, conditions_to_release, prior_utilisation_required, condition_met, tranche_status) VALUES (
        v_grant, 1, 1000000.0, '2026-04-15', 1000000.0, '2026-04-18', 'Advance on signed agreement', NULL, 'N/A (first/lump)', 'Received');
    INSERT INTO grant_tranche (grant_id, tranche_number, tranche_amount, planned_release_date, actual_amount, actual_release_date, conditions_to_release, prior_utilisation_required, condition_met, tranche_status) VALUES (
        v_grant, 2, 1000000.0, '2026-07-15', 1000000.0, '2026-07-20', '≥75% of Tranche 1 utilised + programme milestone / UC accepted', 75.0, 'Met', 'Received');
    INSERT INTO grant_tranche (grant_id, tranche_number, tranche_amount, planned_release_date, actual_amount, actual_release_date, conditions_to_release, prior_utilisation_required, condition_met, tranche_status) VALUES (
        v_grant, 3, 1000000.0, '2026-10-15', NULL, NULL, '≥75% of Tranche 2 utilised + programme milestone / UC accepted', 75.0, 'Pending', 'Expected');

    -- ===== Rohan Kapadia =====
    INSERT INTO donor_master (donor_code, donor_name, donor_type, fund_class, email, pan_card_number, bank_account_ref, donor_source, fund_source_domicile, fcra_applicable, foreign_fund_source_type, foreign_country_name, country, status, is_active) VALUES (
        'DNR-CD-003', 'Rohan Kapadia', 'Individual', 'INDIVIDUAL', 'rohan.contact@example.org', 'AAECG1003K', 'DOM-CA-1001', 'Individual', 'Domestic', false, 'Domestic / NA', NULL, 'India', 'ACTIVE', true) RETURNING id INTO v_donor;
    SELECT id INTO v_prog FROM programme WHERE programme_code = 'PRG-CORE';
    INSERT INTO donor_fund_profile (donor_id, fund_mode, fund_class_code, purpose, programme_tied, programme_id, reporting_frequency, admin_allowed, overhead_limit_percent, movement_allowed, explanation_required, onboarding_complete) VALUES (
        v_donor, 'Unrestricted', 'C', 'Untied general donation', false, v_prog, 'Annual', true, NULL, true, false, true) RETURNING id INTO v_profile;
    INSERT INTO donor_geography (fund_profile_id, geography_name) VALUES (v_profile, 'Pan-India (untied)');
    INSERT INTO donor_disbursement_rule (fund_profile_id, rule_type, release_trigger, min_prior_utilisation_required, milestone_required, rule_description) VALUES (v_profile, 'Lump-sum / on-receipt', 'Unconditional', NULL, false, 'Untied receipt; recognised on receipt, no conditional release schedule.');
    INSERT INTO grant_agreement (grant_code, donor_id, programme_id, fund_profile_id, agreement_name, agreement_date, start_date, end_date, total_grant_amount, grant_currency, fx_locked_rate, reporting_amount_inr, utilised_amount, grant_status) VALUES (
        'ZRY/GA/2026/003', v_donor, v_prog, v_profile, 'Rohan Kapadia - Untied support FY26', '2026-04-01', '2026-04-01', '2027-03-31', 150000.0, 'INR', 1.0, 150000.0, 97500.0, 'ACTIVE') RETURNING id INTO v_grant;
    INSERT INTO grant_tranche (grant_id, tranche_number, tranche_amount, planned_release_date, actual_amount, actual_release_date, conditions_to_release, prior_utilisation_required, condition_met, tranche_status) VALUES (
        v_grant, 1, 150000.0, '2026-04-15', 150000.0, '2026-04-18', 'Lump-sum on receipt (no gate)', NULL, 'N/A (first/lump)', 'Received');

    -- ===== Anjali Verma =====
    INSERT INTO donor_master (donor_code, donor_name, donor_type, fund_class, email, pan_card_number, bank_account_ref, donor_source, fund_source_domicile, fcra_applicable, foreign_fund_source_type, foreign_country_name, country, status, is_active) VALUES (
        'DNR-CD-004', 'Anjali Verma', 'Individual', 'INDIVIDUAL', 'anjali.contact@example.org', 'AAECG1004K', 'DOM-CA-1001', 'Individual', 'Domestic', false, 'Domestic / NA', NULL, 'India', 'ACTIVE', true) RETURNING id INTO v_donor;
    v_prog := NULL;
    INSERT INTO donor_fund_profile (donor_id, fund_mode, fund_class_code, purpose, programme_tied, programme_id, reporting_frequency, admin_allowed, overhead_limit_percent, movement_allowed, explanation_required, onboarding_complete) VALUES (
        v_donor, 'Unrestricted', 'C', 'Untied general donation', false, v_prog, 'Annual', true, NULL, true, false, true) RETURNING id INTO v_profile;
    INSERT INTO donor_geography (fund_profile_id, geography_name) VALUES (v_profile, 'Pan-India (untied)');
    INSERT INTO donor_disbursement_rule (fund_profile_id, rule_type, release_trigger, min_prior_utilisation_required, milestone_required, rule_description) VALUES (v_profile, 'Lump-sum / on-receipt', 'Unconditional', NULL, false, 'Untied receipt; recognised on receipt, no conditional release schedule.');
    INSERT INTO grant_agreement (grant_code, donor_id, programme_id, fund_profile_id, agreement_name, agreement_date, start_date, end_date, total_grant_amount, grant_currency, fx_locked_rate, reporting_amount_inr, utilised_amount, grant_status) VALUES (
        'ZRY/GA/2026/004', v_donor, v_prog, v_profile, 'Anjali Verma - Untied support FY26', '2026-04-01', '2026-04-01', '2027-03-31', 100000.0, 'INR', 1.0, 100000.0, 65000.0, 'ACTIVE') RETURNING id INTO v_grant;
    INSERT INTO grant_tranche (grant_id, tranche_number, tranche_amount, planned_release_date, actual_amount, actual_release_date, conditions_to_release, prior_utilisation_required, condition_met, tranche_status) VALUES (
        v_grant, 1, 100000.0, '2026-04-15', 100000.0, '2026-04-18', 'Lump-sum on receipt (no gate)', NULL, 'N/A (first/lump)', 'Received');

    -- ===== Horizon Global Fund =====
    INSERT INTO donor_master (donor_code, donor_name, donor_type, fund_class, email, pan_card_number, bank_account_ref, donor_source, fund_source_domicile, fcra_applicable, foreign_fund_source_type, foreign_country_name, country, status, is_active) VALUES (
        'DNR-CD-005', 'Horizon Global Fund', 'Foundation', 'INTERNATIONAL', 'horizon.contact@example.org', 'AAECG1005K', 'FCRA-DESIG-SBI-NDMB-0001', 'Untied - UC based', 'Foreign', true, 'Foreign - Government', 'USA', 'India', 'ACTIVE', true) RETURNING id INTO v_donor;
    SELECT id INTO v_prog FROM programme WHERE programme_code = 'PRG-CORE';
    INSERT INTO donor_fund_profile (donor_id, fund_mode, fund_class_code, purpose, programme_tied, programme_id, reporting_frequency, admin_allowed, overhead_limit_percent, movement_allowed, explanation_required, onboarding_complete) VALUES (
        v_donor, 'Unrestricted', 'B', 'Untied but utilisation-context governed', false, v_prog, 'Half-yearly', true, 10.0, true, true, true) RETURNING id INTO v_profile;
    INSERT INTO donor_geography (fund_profile_id, geography_name) VALUES (v_profile, 'Pan-India (untied)');
    INSERT INTO donor_utilisation_rule (fund_profile_id, rule_type, limit_percentage, description) VALUES (v_profile, 'Admin / Overhead cap', 10.0, 'Admin overhead recovery capped at 10% of grant value (per agreement).');
    INSERT INTO donor_disbursement_rule (fund_profile_id, rule_type, release_trigger, min_prior_utilisation_required, milestone_required, rule_description) VALUES (v_profile, 'Tranche-on-report', 'utilisation threshold', 60.0, false, 'Next tranche released after at least 60% of the prior tranche is utilised and a utilisation-context report is submitted; budget-line movement permitted with explanation.');
    INSERT INTO grant_agreement (grant_code, donor_id, programme_id, fund_profile_id, agreement_name, agreement_date, start_date, end_date, total_grant_amount, grant_currency, fx_locked_rate, reporting_amount_inr, utilised_amount, grant_status) VALUES (
        'ZRY/GA/2026/005', v_donor, v_prog, v_profile, 'Horizon Global Fund - Untied support FY26', '2026-04-01', '2026-04-01', '2027-03-31', 200000.0, 'USD', 83.5, 16700000.0, 10855000.0, 'ACTIVE') RETURNING id INTO v_grant;
    INSERT INTO grant_tranche (grant_id, tranche_number, tranche_amount, planned_release_date, actual_amount, actual_release_date, conditions_to_release, prior_utilisation_required, condition_met, tranche_status) VALUES (
        v_grant, 1, 100000.0, '2026-04-15', 100000.0, '2026-04-18', 'Advance on signed agreement', NULL, 'N/A (first/lump)', 'Received');
    INSERT INTO grant_tranche (grant_id, tranche_number, tranche_amount, planned_release_date, actual_amount, actual_release_date, conditions_to_release, prior_utilisation_required, condition_met, tranche_status) VALUES (
        v_grant, 2, 100000.0, '2026-07-15', 100000.0, '2026-07-20', '≥60% of Tranche 1 utilised + utilisation report accepted', 60.0, 'Met', 'Received');

    -- ===== Vikram Nair =====
    INSERT INTO donor_master (donor_code, donor_name, donor_type, fund_class, email, pan_card_number, bank_account_ref, donor_source, fund_source_domicile, fcra_applicable, foreign_fund_source_type, foreign_country_name, country, status, is_active) VALUES (
        'DNR-CD-006', 'Vikram Nair', 'Individual', 'INDIVIDUAL', 'vikram.contact@example.org', 'AAECG1006K', 'DOM-CA-1001', 'Individual', 'Domestic', false, 'Domestic / NA', NULL, 'India', 'ACTIVE', true) RETURNING id INTO v_donor;
    v_prog := NULL;
    INSERT INTO donor_fund_profile (donor_id, fund_mode, fund_class_code, purpose, programme_tied, programme_id, reporting_frequency, admin_allowed, overhead_limit_percent, movement_allowed, explanation_required, onboarding_complete) VALUES (
        v_donor, 'Unrestricted', 'C', 'Untied general donation', false, v_prog, 'Annual', true, NULL, true, false, true) RETURNING id INTO v_profile;
    INSERT INTO donor_geography (fund_profile_id, geography_name) VALUES (v_profile, 'Pan-India (untied)');
    INSERT INTO donor_disbursement_rule (fund_profile_id, rule_type, release_trigger, min_prior_utilisation_required, milestone_required, rule_description) VALUES (v_profile, 'Lump-sum / on-receipt', 'unconditional', NULL, false, 'Untied receipt; recognised on receipt, no conditional release schedule.');
    INSERT INTO grant_agreement (grant_code, donor_id, programme_id, fund_profile_id, agreement_name, agreement_date, start_date, end_date, total_grant_amount, grant_currency, fx_locked_rate, reporting_amount_inr, utilised_amount, grant_status) VALUES (
        'ZRY/GA/2026/006', v_donor, v_prog, v_profile, 'Vikram Nair - Untied support FY26', '2026-04-01', '2026-04-01', '2027-03-31', 120000.0, 'INR', 1.0, 120000.0, 78000.0, 'CLOSED') RETURNING id INTO v_grant;
    INSERT INTO grant_tranche (grant_id, tranche_number, tranche_amount, planned_release_date, actual_amount, actual_release_date, conditions_to_release, prior_utilisation_required, condition_met, tranche_status) VALUES (
        v_grant, 1, 120000.0, '2026-04-15', 120000.0, '2026-04-18', 'Lump-sum on receipt (no gate)', NULL, 'N/A (first/lump)', 'Received');

    -- ===== Suraksha Finserv CSR =====
    INSERT INTO donor_master (donor_code, donor_name, donor_type, fund_class, email, pan_card_number, bank_account_ref, donor_source, fund_source_domicile, fcra_applicable, foreign_fund_source_type, foreign_country_name, country, status, is_active) VALUES (
        'DNR-CD-007', 'Suraksha Finserv CSR', 'Corporate CSR', 'CORPORATE', 'suraksha.contact@example.org', 'AAECG1007K', 'DOM-CA-1001', 'Pre-defined - UC based', 'Domestic', false, 'Domestic / NA', NULL, 'India', 'ACTIVE', true) RETURNING id INTO v_donor;
    SELECT id INTO v_prog FROM programme WHERE programme_code = 'PRG-CLEANAIR';
    INSERT INTO donor_fund_profile (donor_id, fund_mode, fund_class_code, purpose, programme_tied, programme_id, reporting_frequency, admin_allowed, overhead_limit_percent, movement_allowed, explanation_required, onboarding_complete) VALUES (
        v_donor, 'Restricted', 'A', 'Clean Air- pre-defined, UC-based', false, v_prog, 'Quarterly', true, 5.0, false, false, true) RETURNING id INTO v_profile;
    INSERT INTO donor_geography (fund_profile_id, geography_name) VALUES (v_profile, 'Delhi NCR');
    INSERT INTO donor_geography (fund_profile_id, geography_name) VALUES (v_profile, 'Punjab');
    INSERT INTO donor_geography (fund_profile_id, geography_name) VALUES (v_profile, 'Haryana');
    INSERT INTO donor_utilisation_rule (fund_profile_id, rule_type, limit_percentage, description) VALUES (v_profile, 'Admin / Overhead cap', 5.0, 'Admin overhead recovery capped at 5% of grant value (per agreement).');
    INSERT INTO donor_utilisation_rule (fund_profile_id, rule_type, limit_percentage, description) VALUES (v_profile, 'Fundraising cost exclusion', 0.0, 'Grant may not be applied to fundraising / resource-mobilisation cost lines.');
    INSERT INTO donor_disbursement_rule (fund_profile_id, rule_type, release_trigger, min_prior_utilisation_required, milestone_required, rule_description) VALUES (v_profile, 'Tranche-on-UC', 'milestone + utilisation gate', 75.0, true, 'Subsequent tranche released only after utilisation certificate for the prior tranche is accepted.');
    INSERT INTO grant_agreement (grant_code, donor_id, programme_id, fund_profile_id, agreement_name, agreement_date, start_date, end_date, total_grant_amount, grant_currency, fx_locked_rate, reporting_amount_inr, utilised_amount, grant_status) VALUES (
        'ZRY/GA/2026/007', v_donor, v_prog, v_profile, 'Suraksha Finserv CSR: PRG-CLEANAIR FY26', '2026-04-01', '2026-04-01', '2027-03-31', 4000000.0, 'INR', 1.0, 4000000.0, 1733333.33, 'ACTIVE') RETURNING id INTO v_grant;
    INSERT INTO grant_tranche (grant_id, tranche_number, tranche_amount, planned_release_date, actual_amount, actual_release_date, conditions_to_release, prior_utilisation_required, condition_met, tranche_status) VALUES (
        v_grant, 1, 1333333.33, '2026-04-15', 1333333.33, '2026-04-18', 'Advance on signed agreement', NULL, 'N/A (first/lump)', 'Received');
    INSERT INTO grant_tranche (grant_id, tranche_number, tranche_amount, planned_release_date, actual_amount, actual_release_date, conditions_to_release, prior_utilisation_required, condition_met, tranche_status) VALUES (
        v_grant, 2, 1333333.33, '2026-07-15', 1333333.33, '2026-07-20', '≥75% of Tranche 1 utilised + programme milestone / UC accepted', 75.0, 'Met', 'Received');
    INSERT INTO grant_tranche (grant_id, tranche_number, tranche_amount, planned_release_date, actual_amount, actual_release_date, conditions_to_release, prior_utilisation_required, condition_met, tranche_status) VALUES (
        v_grant, 3, 1333333.33, '2026-10-15', NULL, NULL, '≥75% of Tranche 2 utilised + programme milestone / UC accepted', 75.0, 'Pending', 'Expected');

    -- ===== Bluewave Sponsors Ltd =====
    INSERT INTO donor_master (donor_code, donor_name, donor_type, fund_class, email, pan_card_number, bank_account_ref, donor_source, fund_source_domicile, fcra_applicable, foreign_fund_source_type, foreign_country_name, country, status, is_active) VALUES (
        'DNR-CD-008', 'Bluewave Sponsors Ltd', 'Corporate Sponsor', 'INTERNATIONAL', 'bluewave.contact@example.org', 'AAECG1008K', 'FCRA-DESIG-SBI-NDMB-0001', 'Sponsorship', 'Foreign', true, 'Foreign - Private', 'France', 'India', 'ACTIVE', true) RETURNING id INTO v_donor;
    SELECT id INTO v_prog FROM programme WHERE programme_code = 'PRG-ISF';
    INSERT INTO donor_fund_profile (donor_id, fund_mode, fund_class_code, purpose, programme_tied, programme_id, reporting_frequency, admin_allowed, overhead_limit_percent, movement_allowed, explanation_required, onboarding_complete) VALUES (
        v_donor, 'Unrestricted', 'C', 'Sponsorship purpose-tied to India Science Festival only', true, v_prog, 'Annual', true, NULL, false, false, true) RETURNING id INTO v_profile;
    INSERT INTO donor_geography (fund_profile_id, geography_name) VALUES (v_profile, 'Pan-India (festival venues)');
    INSERT INTO donor_disbursement_rule (fund_profile_id, rule_type, release_trigger, min_prior_utilisation_required, milestone_required, rule_description) VALUES (v_profile, 'Lump-sum / on-receipt', 'unconditional', NULL, false, 'Untied receipt; recognised on receipt, no conditional release schedule.');
    INSERT INTO grant_agreement (grant_code, donor_id, programme_id, fund_profile_id, agreement_name, agreement_date, start_date, end_date, total_grant_amount, grant_currency, fx_locked_rate, reporting_amount_inr, utilised_amount, grant_status) VALUES (
        'ZRY/GA/2026/008', v_donor, v_prog, v_profile, 'Bluewave Sponsors Ltd: PRG-ISF FY26', '2026-04-01', '2026-04-01', '2027-03-31', 300000.0, 'GBP', 105.2, 31560000.0, 20514000.0, 'ACTIVE') RETURNING id INTO v_grant;
    INSERT INTO grant_tranche (grant_id, tranche_number, tranche_amount, planned_release_date, actual_amount, actual_release_date, conditions_to_release, prior_utilisation_required, condition_met, tranche_status) VALUES (
        v_grant, 1, 300000.0, '2026-04-15', 300000.0, '2026-04-18', 'Lump-sum on receipt (no gate)', NULL, 'N/A (first/lump)', 'Received');

    -- ===== Priya Sundaram =====
    INSERT INTO donor_master (donor_code, donor_name, donor_type, fund_class, email, pan_card_number, bank_account_ref, donor_source, fund_source_domicile, fcra_applicable, foreign_fund_source_type, foreign_country_name, country, status, is_active) VALUES (
        'DNR-CD-009', 'Priya Sundaram', 'Individual', 'INDIVIDUAL', 'priya.contact@example.org', 'AAECG1009K', 'DOM-CA-1001', 'Individual', 'Domestic', false, 'Domestic / NA', NULL, 'India', 'ACTIVE', true) RETURNING id INTO v_donor;
    SELECT id INTO v_prog FROM programme WHERE programme_code = 'PRG-CORE';
    INSERT INTO donor_fund_profile (donor_id, fund_mode, fund_class_code, purpose, programme_tied, programme_id, reporting_frequency, admin_allowed, overhead_limit_percent, movement_allowed, explanation_required, onboarding_complete) VALUES (
        v_donor, 'Unrestricted', 'C', 'Untied general donation', false, v_prog, 'Annual', true, NULL, true, false, true) RETURNING id INTO v_profile;
    INSERT INTO donor_geography (fund_profile_id, geography_name) VALUES (v_profile, 'Pan-India (untied)');
    INSERT INTO donor_disbursement_rule (fund_profile_id, rule_type, release_trigger, min_prior_utilisation_required, milestone_required, rule_description) VALUES (v_profile, 'Lump-sum / on-receipt', 'unconditional', NULL, false, 'Untied receipt; recognised on receipt, no conditional release schedule.');
    INSERT INTO grant_agreement (grant_code, donor_id, programme_id, fund_profile_id, agreement_name, agreement_date, start_date, end_date, total_grant_amount, grant_currency, fx_locked_rate, reporting_amount_inr, utilised_amount, grant_status) VALUES (
        'ZRY/GA/2026/009', v_donor, v_prog, v_profile, 'Priya Sundaram - Untied support FY26', '2026-04-01', '2026-04-01', '2027-03-31', 90000.0, 'INR', 1.0, 90000.0, 58500.0, 'ACTIVE') RETURNING id INTO v_grant;
    INSERT INTO grant_tranche (grant_id, tranche_number, tranche_amount, planned_release_date, actual_amount, actual_release_date, conditions_to_release, prior_utilisation_required, condition_met, tranche_status) VALUES (
        v_grant, 1, 90000.0, '2026-04-15', 90000.0, '2026-04-18', 'Lump-sum on receipt (no gate)', NULL, 'N/A (first/lump)', 'Received');

    -- ===== Tarang Energy CSR Foundation =====
    INSERT INTO donor_master (donor_code, donor_name, donor_type, fund_class, email, pan_card_number, bank_account_ref, donor_source, fund_source_domicile, fcra_applicable, foreign_fund_source_type, foreign_country_name, country, status, is_active) VALUES (
        'DNR-CD-010', 'Tarang Energy CSR Foundation', 'Corporate CSR', 'CORPORATE', 'tarang.contact@example.org', 'AAECG1010K', 'DOM-CA-1001', 'CSR', 'Domestic', false, 'Domestic / NA', NULL, 'India', 'ACTIVE', true) RETURNING id INTO v_donor;
    SELECT id INTO v_prog FROM programme WHERE programme_code = 'PRG-EDU';
    INSERT INTO donor_fund_profile (donor_id, fund_mode, fund_class_code, purpose, programme_tied, programme_id, reporting_frequency, admin_allowed, overhead_limit_percent, movement_allowed, explanation_required, onboarding_complete) VALUES (
        v_donor, 'Restricted', 'A', 'Education & Livelihoods- defined project', false, v_prog, 'Quarterly', true, 5.0, false, false, true) RETURNING id INTO v_profile;
    INSERT INTO donor_geography (fund_profile_id, geography_name) VALUES (v_profile, 'Bihar');
    INSERT INTO donor_geography (fund_profile_id, geography_name) VALUES (v_profile, 'Jharkhand');
    INSERT INTO donor_utilisation_rule (fund_profile_id, rule_type, limit_percentage, description) VALUES (v_profile, 'Admin / Overhead cap', 5.0, 'Admin overhead recovery capped at 5% of grant value (per agreement).');
    INSERT INTO donor_utilisation_rule (fund_profile_id, rule_type, limit_percentage, description) VALUES (v_profile, 'Fundraising cost exclusion', 0.0, 'Grant may not be applied to fundraising / resource-mobilisation cost lines.');
    INSERT INTO donor_disbursement_rule (fund_profile_id, rule_type, release_trigger, min_prior_utilisation_required, milestone_required, rule_description) VALUES (v_profile, 'Tranche-on-UC', 'milestone + utilisation gate', 75.0, true, 'Next tranche released only after (a) at least 75% of the prior tranche is utilised AND (b) the agreed programme milestone / utilisation certificate for the period is accepted by the donor.');
    INSERT INTO grant_agreement (grant_code, donor_id, programme_id, fund_profile_id, agreement_name, agreement_date, start_date, end_date, total_grant_amount, grant_currency, fx_locked_rate, reporting_amount_inr, utilised_amount, grant_status) VALUES (
        'ZRY/GA/2026/010', v_donor, v_prog, v_profile, 'Tarang Energy CSR Foundation: PRG-EDU FY26', '2026-04-01', '2026-04-01', '2027-03-31', 6000000.0, 'INR', 1.0, 6000000.0, 2600000.0, 'ACTIVE') RETURNING id INTO v_grant;
    INSERT INTO grant_tranche (grant_id, tranche_number, tranche_amount, planned_release_date, actual_amount, actual_release_date, conditions_to_release, prior_utilisation_required, condition_met, tranche_status) VALUES (
        v_grant, 1, 2000000.0, '2026-04-15', 2000000.0, '2026-04-18', 'Advance on signed agreement', NULL, 'N/A (first/lump)', 'Received');
    INSERT INTO grant_tranche (grant_id, tranche_number, tranche_amount, planned_release_date, actual_amount, actual_release_date, conditions_to_release, prior_utilisation_required, condition_met, tranche_status) VALUES (
        v_grant, 2, 2000000.0, '2026-07-15', 2000000.0, '2026-07-20', '≥75% of Tranche 1 utilised + programme milestone / UC accepted', 75.0, 'Met', 'Received');
    INSERT INTO grant_tranche (grant_id, tranche_number, tranche_amount, planned_release_date, actual_amount, actual_release_date, conditions_to_release, prior_utilisation_required, condition_met, tranche_status) VALUES (
        v_grant, 3, 2000000.0, '2026-10-15', NULL, NULL, '≥75% of Tranche 2 utilised + programme milestone / UC accepted', 75.0, 'Pending', 'Expected');

    -- ===== Aarohan CSR Foundation =====
    INSERT INTO donor_master (donor_code, donor_name, donor_type, fund_class, email, pan_card_number, bank_account_ref, donor_source, fund_source_domicile, fcra_applicable, foreign_fund_source_type, foreign_country_name, country, status, is_active) VALUES (
        'DNR-CD-011', 'Aarohan CSR Foundation', 'Corporate CSR', 'CORPORATE', 'aarohan.contact@example.org', 'AAECG1011K', 'DOM-CA-1001', 'CSR', 'Domestic', false, 'Domestic / NA', NULL, 'India', 'ACTIVE', true) RETURNING id INTO v_donor;
    SELECT id INTO v_prog FROM programme WHERE programme_code = 'PRG-ISF';
    INSERT INTO donor_fund_profile (donor_id, fund_mode, fund_class_code, purpose, programme_tied, programme_id, reporting_frequency, admin_allowed, overhead_limit_percent, movement_allowed, explanation_required, onboarding_complete) VALUES (
        v_donor, 'Restricted', 'A', 'CSR purpose-tied to India Science Festival', true, v_prog, 'Quarterly', true, 5.0, false, false, true) RETURNING id INTO v_profile;
    INSERT INTO donor_geography (fund_profile_id, geography_name) VALUES (v_profile, 'Pan-India (festival venues)');
    INSERT INTO donor_utilisation_rule (fund_profile_id, rule_type, limit_percentage, description) VALUES (v_profile, 'Admin / Overhead cap', 5.0, 'Admin overhead recovery capped at 5% of grant value (per agreement).');
    INSERT INTO donor_utilisation_rule (fund_profile_id, rule_type, limit_percentage, description) VALUES (v_profile, 'Fundraising cost exclusion', 0.0, 'Grant may not be applied to fundraising / resource-mobilisation cost lines.');
    INSERT INTO donor_disbursement_rule (fund_profile_id, rule_type, release_trigger, min_prior_utilisation_required, milestone_required, rule_description) VALUES (v_profile, 'Tranche-on-UC', 'milestone + utilisation gate', 75.0, true, 'Next tranche released only after (a) at least 75% of the prior tranche is utilised AND (b) the agreed programme milestone / utilisation certificate for the period is accepted by the donor.');
    INSERT INTO grant_agreement (grant_code, donor_id, programme_id, fund_profile_id, agreement_name, agreement_date, start_date, end_date, total_grant_amount, grant_currency, fx_locked_rate, reporting_amount_inr, utilised_amount, grant_status) VALUES (
        'ZRY/GA/2026/011', v_donor, v_prog, v_profile, 'Aarohan CSR Foundation: PRG-ISF FY26', '2026-04-01', '2026-04-01', '2027-03-31', 3500000.0, 'INR', 1.0, 3500000.0, 1516666.67, 'ACTIVE') RETURNING id INTO v_grant;
    INSERT INTO grant_tranche (grant_id, tranche_number, tranche_amount, planned_release_date, actual_amount, actual_release_date, conditions_to_release, prior_utilisation_required, condition_met, tranche_status) VALUES (
        v_grant, 1, 1166666.67, '2026-04-15', 1166666.67, '2026-04-18', 'Advance on signed agreement', NULL, 'N/A (first/lump)', 'Received');
    INSERT INTO grant_tranche (grant_id, tranche_number, tranche_amount, planned_release_date, actual_amount, actual_release_date, conditions_to_release, prior_utilisation_required, condition_met, tranche_status) VALUES (
        v_grant, 2, 1166666.67, '2026-07-15', 1166666.67, '2026-07-20', '≥75% of Tranche 1 utilised + programme milestone / UC accepted', 75.0, 'Met', 'Received');
    INSERT INTO grant_tranche (grant_id, tranche_number, tranche_amount, planned_release_date, actual_amount, actual_release_date, conditions_to_release, prior_utilisation_required, condition_met, tranche_status) VALUES (
        v_grant, 3, 1166666.67, '2026-10-15', NULL, NULL, '≥75% of Tranche 2 utilised + programme milestone / UC accepted', 75.0, 'Pending', 'Expected');

    -- ===== Dr. Sunil Kulkarni =====
    INSERT INTO donor_master (donor_code, donor_name, donor_type, fund_class, email, pan_card_number, bank_account_ref, donor_source, fund_source_domicile, fcra_applicable, foreign_fund_source_type, foreign_country_name, country, status, is_active) VALUES (
        'DNR-CD-012', 'Dr. Sunil Kulkarni', 'Individual', 'INDIVIDUAL', 'dr..contact@example.org', 'AAECG1012K', 'DOM-CA-1001', 'Individual - ISBF', 'Domestic', false, 'Domestic / NA', NULL, 'India', 'ACTIVE', true) RETURNING id INTO v_donor;
    SELECT id INTO v_prog FROM programme WHERE programme_code = 'PRG-ISBF';
    INSERT INTO donor_fund_profile (donor_id, fund_mode, fund_class_code, purpose, programme_tied, programme_id, reporting_frequency, admin_allowed, overhead_limit_percent, movement_allowed, explanation_required, onboarding_complete) VALUES (
        v_donor, 'Restricted', 'A', 'Restricted to one specific ISBF book', true, v_prog, 'Quarterly', false, NULL, false, false, true) RETURNING id INTO v_profile;
    INSERT INTO donor_geography (fund_profile_id, geography_name) VALUES (v_profile, 'Pan-India (publication)');
    INSERT INTO donor_utilisation_rule (fund_profile_id, rule_type, limit_percentage, description) VALUES (v_profile, 'Fundraising cost exclusion', 0.0, 'Grant may not be applied to fundraising / resource-mobilisation cost lines.');
    INSERT INTO donor_disbursement_rule (fund_profile_id, rule_type, release_trigger, min_prior_utilisation_required, milestone_required, rule_description) VALUES (v_profile, 'Tranche-on-UC', 'milestone + utilisation gate', 75.0, true, 'Next tranche released only after (a) at least 75% of the prior tranche is utilised AND (b) the agreed programme milestone / utilisation certificate for the period is accepted by the donor.');
    INSERT INTO grant_agreement (grant_code, donor_id, programme_id, fund_profile_id, agreement_name, agreement_date, start_date, end_date, total_grant_amount, grant_currency, fx_locked_rate, reporting_amount_inr, utilised_amount, grant_status) VALUES (
        'ZRY/GA/2026/012', v_donor, v_prog, v_profile, 'Dr. Sunil Kulkarni: PRG-ISBF FY26', '2026-04-01', '2026-04-01', '2027-03-31', 500000.0, 'INR', 1.0, 500000.0, 216666.67, 'ACTIVE') RETURNING id INTO v_grant;
    INSERT INTO grant_tranche (grant_id, tranche_number, tranche_amount, planned_release_date, actual_amount, actual_release_date, conditions_to_release, prior_utilisation_required, condition_met, tranche_status) VALUES (
        v_grant, 1, 166666.67, '2026-04-15', 166666.67, '2026-04-18', 'Advance on signed agreement', NULL, 'N/A (first/lump)', 'Received');
    INSERT INTO grant_tranche (grant_id, tranche_number, tranche_amount, planned_release_date, actual_amount, actual_release_date, conditions_to_release, prior_utilisation_required, condition_met, tranche_status) VALUES (
        v_grant, 2, 166666.67, '2026-07-15', 166666.67, '2026-07-20', '≥75% of Tranche 1 utilised + programme milestone / UC accepted', 75.0, 'Met', 'Received');
    INSERT INTO grant_tranche (grant_id, tranche_number, tranche_amount, planned_release_date, actual_amount, actual_release_date, conditions_to_release, prior_utilisation_required, condition_met, tranche_status) VALUES (
        v_grant, 3, 166666.67, '2026-10-15', NULL, NULL, '≥75% of Tranche 2 utilised + programme milestone / UC accepted', 75.0, 'Pending', 'Expected');

    -- ===== Vidya Global Trust =====
    INSERT INTO donor_master (donor_code, donor_name, donor_type, fund_class, email, pan_card_number, bank_account_ref, donor_source, fund_source_domicile, fcra_applicable, foreign_fund_source_type, foreign_country_name, country, status, is_active) VALUES (
        'DNR-CD-013', 'Vidya Global Trust', 'Foundation', 'INTERNATIONAL', 'vidya.contact@example.org', 'AAECG1013K', 'FCRA-DESIG-SBI-NDMB-0001', 'Sponsorship - ISBF', 'Foreign', true, 'Foreign - Private', 'Germany', 'India', 'ACTIVE', true) RETURNING id INTO v_donor;
    SELECT id INTO v_prog FROM programme WHERE programme_code = 'PRG-ISBF';
    INSERT INTO donor_fund_profile (donor_id, fund_mode, fund_class_code, purpose, programme_tied, programme_id, reporting_frequency, admin_allowed, overhead_limit_percent, movement_allowed, explanation_required, onboarding_complete) VALUES (
        v_donor, 'Restricted', 'A', 'Sponsorship restricted to one ISBF book', true, v_prog, 'Quarterly', true, 10.0, false, false, true) RETURNING id INTO v_profile;
    INSERT INTO donor_geography (fund_profile_id, geography_name) VALUES (v_profile, 'Pan-India (publication)');
    INSERT INTO donor_utilisation_rule (fund_profile_id, rule_type, limit_percentage, description) VALUES (v_profile, 'Admin / Overhead cap', 10.0, 'Admin overhead recovery capped at 10% of grant value (per agreement).');
    INSERT INTO donor_utilisation_rule (fund_profile_id, rule_type, limit_percentage, description) VALUES (v_profile, 'Fundraising cost exclusion', 0.0, 'Grant may not be applied to fundraising / resource-mobilisation cost lines.');
    INSERT INTO donor_disbursement_rule (fund_profile_id, rule_type, release_trigger, min_prior_utilisation_required, milestone_required, rule_description) VALUES (v_profile, 'Tranche-on-UC', 'milestone + utilisation gate', 75.0, true, 'Next tranche released only after (a) at least 75% of the prior tranche is utilised AND (b) the agreed programme milestone / utilisation certificate for the period is accepted by the donor.');
    INSERT INTO grant_agreement (grant_code, donor_id, programme_id, fund_profile_id, agreement_name, agreement_date, start_date, end_date, total_grant_amount, grant_currency, fx_locked_rate, reporting_amount_inr, utilised_amount, grant_status) VALUES (
        'ZRY/GA/2026/013', v_donor, v_prog, v_profile, 'Vidya Global Trust: PRG-ISBF FY26', '2026-04-01', '2026-04-01', '2027-03-31', 400000.0, 'EUR', 90.1, 36040000.0, 7808666.47, 'ACTIVE') RETURNING id INTO v_grant;
    INSERT INTO grant_tranche (grant_id, tranche_number, tranche_amount, planned_release_date, actual_amount, actual_release_date, conditions_to_release, prior_utilisation_required, condition_met, tranche_status) VALUES (
        v_grant, 1, 133333.33, '2026-04-15', 133333.33, '2026-04-18', 'Advance on signed agreement', NULL, 'N/A (first/lump)', 'Received');
    INSERT INTO grant_tranche (grant_id, tranche_number, tranche_amount, planned_release_date, actual_amount, actual_release_date, conditions_to_release, prior_utilisation_required, condition_met, tranche_status) VALUES (
        v_grant, 2, 133333.33, '2026-07-15', NULL, NULL, '≥75% of Tranche 1 utilised + programme milestone / UC accepted', 75.0, 'Pending', 'Expected');
    INSERT INTO grant_tranche (grant_id, tranche_number, tranche_amount, planned_release_date, actual_amount, actual_release_date, conditions_to_release, prior_utilisation_required, condition_met, tranche_status) VALUES (
        v_grant, 3, 133333.33, '2026-10-15', NULL, NULL, '≥75% of Tranche 2 utilised + programme milestone / UC accepted', 75.0, 'Pending', 'Expected');

END IF;
END $$;
