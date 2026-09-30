-- V110: Budget Category no longer carries a separate code — the auto-generated
--       id is the stable key budget lines store (as for Department and Donor
--       Type), and name stays the unique display label.
ALTER TABLE budget_category DROP COLUMN code;
