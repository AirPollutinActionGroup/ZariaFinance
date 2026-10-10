-- V103: V102 only matched uppercase A/B/C; at least one donation row stored
-- the legacy restriction-class letter in lowercase ('b'), which still fails
-- FundClass enum hydration. Normalise case-insensitively this time.
UPDATE donation
SET fund_class = CASE UPPER(fund_class)
    WHEN 'A' THEN 'CLASS_A_RESTRICTED'
    WHEN 'B' THEN 'CLASS_B_UNRESTRICTED'
    WHEN 'C' THEN 'CLASS_C_UNRESTRICTED'
    ELSE fund_class
END
WHERE UPPER(fund_class) IN ('A', 'B', 'C');
