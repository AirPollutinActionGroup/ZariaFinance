-- V57: Organisation short names are always stored lowercase and must be
-- unique across the register.
UPDATE organisation_register SET short_name = LOWER(short_name);

ALTER TABLE organisation_register
    ADD CONSTRAINT uk_organisation_register_short_name UNIQUE (short_name);
