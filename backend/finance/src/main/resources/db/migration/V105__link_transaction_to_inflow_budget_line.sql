-- V105: A Credit transaction recorded via the New Transaction form can be
--       linked to the donor tranche criterion (Inflow Budget line) it
--       receipts against, so recording the money there also marks that
--       line received instead of the two staying disconnected.
ALTER TABLE finance_transaction
    ADD COLUMN inflow_budget_line_id BIGINT,
    ADD CONSTRAINT fk_transaction_inflow_budget_line
        FOREIGN KEY (inflow_budget_line_id) REFERENCES donor_tranche_criterion (id);
