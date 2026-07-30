-- V51: The V20/V21/V25 seed data was written before donor_fund_profile.reporting_frequency
-- and donor_utilisation_rule.rule_type became @Enumerated(EnumType.STRING) columns,
-- so it still holds human labels ('Quarterly') rather than enum constant names
-- ('QUARTERLY'). Hibernate throws InvalidDataAccessApiUsageException reading these
-- rows today — normalize them to the enum constant names.

UPDATE donor_fund_profile SET reporting_frequency = 'QUARTERLY' WHERE reporting_frequency = 'Quarterly';
UPDATE donor_fund_profile SET reporting_frequency = 'HALF_YEARLY' WHERE reporting_frequency = 'Half-yearly';
UPDATE donor_fund_profile SET reporting_frequency = 'ANNUAL' WHERE reporting_frequency = 'Annual';

UPDATE donor_utilisation_rule SET rule_type = 'ADMIN_OVERHEAD_COST' WHERE rule_type = 'Admin / Overhead cap';

-- RestrictionRuleType has no dedicated "fundraising cost exclusion" case; preserve
-- the original label as the free-text "other" companion instead of dropping it.
UPDATE donor_utilisation_rule
    SET rule_type = 'OTHER_CUSTOM', other_rule_type = 'Fundraising cost exclusion'
    WHERE rule_type = 'Fundraising cost exclusion';
