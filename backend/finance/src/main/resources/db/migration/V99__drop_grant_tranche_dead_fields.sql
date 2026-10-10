-- prior_utilisation_required and utilisation_end_date were never written or
-- read by any live code path (no create/receive request field, no frontend
-- display). utilised_amount was likewise never written by the app — it was
-- one-off backfilled in V23 and only ever displayed as fake data on the
-- grant detail page; that display is removed alongside this column.
ALTER TABLE grant_tranche
    DROP COLUMN IF EXISTS prior_utilisation_required,
    DROP COLUMN IF EXISTS utilised_amount,
    DROP COLUMN IF EXISTS utilisation_end_date;
