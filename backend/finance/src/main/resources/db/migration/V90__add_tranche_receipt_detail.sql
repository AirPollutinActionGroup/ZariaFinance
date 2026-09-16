-- V90: Grant tranche receipt detail — bank reference, receipt voucher number,
--      variance reason and actual FX rate, captured alongside actual_amount /
--      actual_release_date when a tranche receipt is recorded. Feeds the
--      Inflow Budget module (previously mock data).
ALTER TABLE grant_tranche
    ADD COLUMN bank_reference     VARCHAR(100),
    ADD COLUMN receipt_voucher_no VARCHAR(100),
    ADD COLUMN variance_reason    VARCHAR(500),
    ADD COLUMN actual_fx_rate     NUMERIC(12, 6);
