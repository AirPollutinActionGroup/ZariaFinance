-- V54: Payroll giving's employer-match sub-flow collects a match amount and,
-- when the employer's money is CSR-routed, a financial year and project
-- reference — none of which donation_payroll_batch had a column for, so the
-- frontend silently dropped them on save.

ALTER TABLE donation_payroll_batch
    ADD COLUMN match_amount       DECIMAL(19, 2),
    ADD COLUMN csr_financial_year VARCHAR(20),
    ADD COLUMN csr_project_ref    VARCHAR(255);
