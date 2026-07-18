-- V23 (issue #21, item 13): capture the Tranche-on-UC funding cycle.
-- Each tranche records the amount utilised up to the end of its period, so a Donor
-- Utilisation Certificate can be generated per tranche (received vs utilised).

ALTER TABLE grant_tranche ADD COLUMN IF NOT EXISTS utilised_amount NUMERIC(18, 2);
ALTER TABLE grant_tranche ADD COLUMN IF NOT EXISTS utilisation_end_date DATE;

-- Derive each tranche's period-end generically from the schedule itself: a tranche's
-- period runs until the day before the next tranche's planned release, and the final
-- tranche's period ends at the grant end date. No fixed interval is assumed.
UPDATE grant_tranche t
SET utilisation_end_date = COALESCE(
        (SELECT MIN(n.planned_release_date) - 1
             FROM grant_tranche n
             WHERE n.grant_id = t.grant_id
               AND n.tranche_number > t.tranche_number),
        (SELECT g.end_date FROM grant_agreement g WHERE g.id = t.grant_id))
WHERE t.utilisation_end_date IS NULL;

-- Seed per-tranche utilisation from the grant's real, already-recorded utilised
-- amount rather than any invented figure: allocate it across received tranches
-- earliest-first (each tranche absorbs utilisation up to the amount it received,
-- the remainder cascading to later tranches). Finance can refine per actual UC.
WITH allocation AS (
    SELECT t.id,
           GREATEST(0, LEAST(
               t.actual_amount,
               g.utilised_amount - COALESCE(SUM(t.actual_amount) OVER (
                   PARTITION BY t.grant_id
                   ORDER BY t.tranche_number
                   ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING), 0)
           )) AS allocated
    FROM grant_tranche t
    JOIN grant_agreement g ON g.id = t.grant_id
    WHERE t.actual_amount IS NOT NULL
)
UPDATE grant_tranche gt
SET utilised_amount = a.allocated
FROM allocation a
WHERE gt.id = a.id
  AND gt.utilised_amount IS NULL;
