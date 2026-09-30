-- V119: Retire the Payment Window (Cr/Dr) transaction module. Donor receipts
--       are recorded directly against the inflow budget line, and payments
--       go through Debit Notes, so finance_transaction (V89) is no longer used.
--       Inflow receipts it posted keep their amount/date/reference; only the
--       now-dangling link back to the transaction is dropped.
ALTER TABLE inflow_receipt DROP COLUMN IF EXISTS transaction_id;

DROP TABLE IF EXISTS finance_transaction;
