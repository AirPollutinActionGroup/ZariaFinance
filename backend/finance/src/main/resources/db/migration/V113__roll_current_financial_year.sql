-- V113: V72 seeded FY 2025-26 as current, which leaves the "current" flag on
--       a CLOSED year once that period ends. Move the flag to the year whose
--       period contains today. Does nothing if no such year exists, so the
--       existing current year is kept rather than leaving none.
--       Cleared first, then set, so the one-current unique index
--       (uq_financial_year_current) is never violated mid-update.
DO $$
DECLARE
    today_year_id BIGINT;
BEGIN
    SELECT id INTO today_year_id
    FROM financial_year
    WHERE CURRENT_DATE BETWEEN start_date AND end_date
    ORDER BY start_date DESC
    LIMIT 1;

    IF today_year_id IS NOT NULL THEN
        UPDATE financial_year SET is_current = false, updated_at = CURRENT_TIMESTAMP
        WHERE is_current = true AND id <> today_year_id;

        UPDATE financial_year SET is_current = true, updated_at = CURRENT_TIMESTAMP
        WHERE id = today_year_id AND is_current = false;
    END IF;
END $$;
