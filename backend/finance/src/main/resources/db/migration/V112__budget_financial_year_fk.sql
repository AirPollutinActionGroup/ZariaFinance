-- V112: Link each budget to the Financial Year master. `financial_year`
--       (e.g. "2026-27") stays as the label the UI filters and links by; it
--       is now always derived from the linked year's start date.
ALTER TABLE budget ADD COLUMN financial_year_id BIGINT REFERENCES financial_year(id);

-- Backfill any existing budgets by matching the label's start year.
UPDATE budget b
SET financial_year_id = fy.id
FROM financial_year fy
WHERE EXTRACT(YEAR FROM fy.start_date)::INT = CAST(SUBSTRING(b.financial_year, 1, 4) AS INT);

ALTER TABLE budget ALTER COLUMN financial_year_id SET NOT NULL;

CREATE INDEX idx_budget_financial_year_id ON budget(financial_year_id);
