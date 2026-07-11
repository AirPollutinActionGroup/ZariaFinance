-- V18: Convert donor_fund_profile.fund_class_code from CHAR(1) to VARCHAR(1).
--
-- CHAR(1) is reported as JDBC CHAR and can trip Hibernate's schema validation
-- against a String field (which maps to VARCHAR). This forward-only migration
-- aligns the column type with the entity mapping (V14 is left untouched so its
-- checksum stays valid).

ALTER TABLE donor_fund_profile
    ALTER COLUMN fund_class_code TYPE VARCHAR(1);
