-- V64: Align user_register_new with the entity's updated field names —
--      organisation_id becomes organization_id (matching
--      organization_register's American spelling) — and add the approval
--      workflow fields (approved_by, is_approved) mirroring the legacy
--      userRegister module's users table.
ALTER TABLE user_register_new RENAME COLUMN organisation_id TO organization_id;
ALTER TABLE user_register_new
    RENAME CONSTRAINT fk_user_register_new_organisation TO fk_user_register_new_organization;
ALTER INDEX idx_user_register_new_organisation_id RENAME TO idx_user_register_new_organization_id;

ALTER TABLE user_register_new
    ADD COLUMN approved_by BIGINT NULL,
    ADD COLUMN is_approved INTEGER NOT NULL DEFAULT 2;
