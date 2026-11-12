-- Human-readable, system-generated identifier for a donor fund profile:
-- FP-{year}-{nnn}, one sequence per calendar year of creation (mirrors the
-- DN-/CN- note codes). Existing profiles are backfilled in creation order.

ALTER TABLE donor_fund_profile ADD COLUMN profile_code VARCHAR(30);

UPDATE donor_fund_profile p
SET profile_code = numbered.code
FROM (
    SELECT id,
           'FP-' || EXTRACT(YEAR FROM created_at)::int || '-' ||
           LPAD(ROW_NUMBER() OVER (
                    PARTITION BY EXTRACT(YEAR FROM created_at)
                    ORDER BY created_at, id)::text, 3, '0') AS code
    FROM donor_fund_profile
) numbered
WHERE p.id = numbered.id;

ALTER TABLE donor_fund_profile ALTER COLUMN profile_code SET NOT NULL;
ALTER TABLE donor_fund_profile ADD CONSTRAINT uk_donor_fund_profile_code UNIQUE (profile_code);
