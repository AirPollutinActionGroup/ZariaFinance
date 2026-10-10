-- V106: finance_transaction.bank_account was a free mock string (no backend
--       master existed yet). Replace it with a real FK to bank_details, now
--       that the Bank Details master is wired into the New Transaction form.
ALTER TABLE finance_transaction DROP COLUMN bank_account;
ALTER TABLE finance_transaction ADD COLUMN bank_account_id BIGINT REFERENCES bank_details(id);
