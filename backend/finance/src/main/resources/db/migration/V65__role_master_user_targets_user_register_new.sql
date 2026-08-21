-- V65: Role assignment (role_master_user) now targets user_register_new
--      (the extended registration flow) instead of the legacy userRegister
--      module's `users` table — that table has no notion of Role Directory
--      roles or organisations. role_master_user is empty at this point, so
--      this is a pure FK repoint, not a data migration.
ALTER TABLE role_master_user DROP CONSTRAINT fk_role_master_user_user;
ALTER TABLE role_master_user
    ADD CONSTRAINT fk_role_master_user_user FOREIGN KEY (user_id) REFERENCES user_register_new(id);
