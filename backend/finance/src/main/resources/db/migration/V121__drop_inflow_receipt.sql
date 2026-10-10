-- V121: Money received on an Inflow Budget line is now recorded only as a
--       credit note against its tranche, so the separate receipt table (V108,
--       last written by the retired Payment Window) goes. Its rows were test
--       data and are dropped with it.
DROP TABLE IF EXISTS inflow_receipt;
