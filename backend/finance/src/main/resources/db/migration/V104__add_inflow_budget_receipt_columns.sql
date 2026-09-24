-- V100: Inflow Budget receipt detail on the donor tranche schedule.
--       Each donor_tranche_criterion row is an expected receipt (grant
--       tranche); recording a receipt against it fills these columns.
--       Grants report in INR at par, so no FX column is needed here.
ALTER TABLE donor_tranche_criterion
    ADD COLUMN actual_received_date   DATE,
    ADD COLUMN actual_received_amount NUMERIC(19, 2),
    ADD COLUMN bank_reference         VARCHAR(100),
    ADD COLUMN receipt_voucher_no     VARCHAR(100),
    ADD COLUMN variance_reason        VARCHAR(500);
