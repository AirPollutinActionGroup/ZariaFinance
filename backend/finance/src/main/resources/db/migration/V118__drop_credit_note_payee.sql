-- Credit notes no longer record a payee.
ALTER TABLE credit_note
    DROP COLUMN payee_category,
    DROP COLUMN payee_ref,
    DROP COLUMN payee_name;
