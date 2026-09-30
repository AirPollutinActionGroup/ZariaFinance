-- Credit notes are no longer tied to an outflow row or a debit note: they don't
-- change a row's Spent, they only record money that came back (optionally to a
-- donor fund). Dropping the columns also drops their FKs, check constraints
-- (ck_credit_note_quarter / _row / _debit) and indexes.
ALTER TABLE credit_note
    DROP COLUMN debit_note_id,
    DROP COLUMN budget_line_id,
    DROP COLUMN quarter;
