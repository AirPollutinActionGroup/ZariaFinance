-- approved_by was VARCHAR(255) (V35); existing non-numeric values (e.g. seeded
-- test data with an email/name string) can't cast directly, so null them out.
ALTER TABLE grant_agreement
    ALTER COLUMN approved_by TYPE BIGINT USING (
        CASE WHEN approved_by ~ '^\d+$' THEN approved_by::bigint ELSE NULL END
    );
