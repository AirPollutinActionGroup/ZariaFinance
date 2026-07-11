-- V12: Sample users for local development / demo.
--
-- Roles mirror the frontend permission model (CEO / FINANCE_OFFICER /
-- FUNDRAISING_LEAD). is_approved: 1 = approved, 2 = pending, 3 = rejected.
--
-- NOTE: passwords are stored in PLAIN TEXT to match the current login flow
-- (LoginServiceImpl compares raw strings) and are all >= 8 chars to satisfy the
-- login request validation. These are DEMO credentials only — remove this
-- migration (or replace with hashed passwords) before any production deploy.
--
-- Idempotent: ON CONFLICT DO NOTHING skips rows whose username / email / mobile
-- already exist, so re-running against a partially-seeded DB is safe.

INSERT INTO users
    (first_name, last_name, email_id,          mobile_no,    username,    password,      role,              approved_by, is_approved, status, created_at,        updated_at)
VALUES
    ('Aarav',  'Sharma',  'ceo@zaria.test',      '9000000010', 'ceoadmin',   'Ceo@12345',    'CEO',             NULL, 1, TRUE,  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Priya',  'Nair',    'finance@zaria.test',  '9000000011', 'financeofc', 'Finance@123',  'FINANCE_OFFICER', NULL, 1, TRUE,  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Rahul',  'Kapoor',  'fundraise@zaria.test','9000000012', 'fundlead',   'Fund@12345',   'FUNDRAISING_LEAD',NULL, 1, TRUE,  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Sneha',  'Iyer',    'pending@zaria.test',  '9000000013', 'pendingfo',  'Pending@123',  'FINANCE_OFFICER', NULL, 2, TRUE,  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Vikram', 'Menon',   'rejected@zaria.test', '9000000014', 'rejectedfl', 'Rejected@12',  'FUNDRAISING_LEAD',NULL, 3, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;
