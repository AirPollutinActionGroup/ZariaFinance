-- V115: Debit and credit notes have no cancel workflow — every note counts.
--       Drop the status and cancellation columns (their CHECK constraints and
--       status indexes go with them).
ALTER TABLE debit_note
    DROP COLUMN status,
    DROP COLUMN cancelled_by,
    DROP COLUMN cancelled_at,
    DROP COLUMN cancel_note;

ALTER TABLE credit_note
    DROP COLUMN status,
    DROP COLUMN cancelled_by,
    DROP COLUMN cancelled_at,
    DROP COLUMN cancel_note;
