-- grant_rule, grant_reporting, grant_budget_head, grant_kpi and grant_geography
-- (V5/V6) were never wired to any service/controller — the rules and geography
-- concepts they modelled live on the donor fund profile instead (V15).
-- grant_agreement.fund_class was superseded by fund_profile.fund_class (V15/V19)
-- and never read from GrantAgreement again.
DROP TABLE IF EXISTS grant_rule;
DROP TABLE IF EXISTS grant_reporting;
DROP TABLE IF EXISTS grant_budget_head;
DROP TABLE IF EXISTS grant_kpi;
DROP TABLE IF EXISTS grant_geography;

ALTER TABLE grant_agreement
    DROP COLUMN IF EXISTS fund_class;
