-- V81: Programme gains Type (Programme/Project, with an optional parent
--      programme for projects), Start/End dates, State/City (multi-select,
--      mirroring employee_state/employee_city), an optional Remark, and a
--      richer lifecycle Status. is_active stays as the simple active/inactive
--      flag other code already depends on (e.g. Employee's primary-programme
--      picker) and is kept in sync with status (Active -> true, else false).
--      Existing rows have no recorded lifecycle detail, so they backfill
--      from is_active: true -> Active, false -> Close.
ALTER TABLE programme ADD COLUMN type VARCHAR(20) NOT NULL DEFAULT 'Programme';
ALTER TABLE programme ADD CONSTRAINT chk_programme_type CHECK (type IN ('Programme', 'Project'));

ALTER TABLE programme ADD COLUMN parent_programme_id BIGINT REFERENCES programme(id);
ALTER TABLE programme ADD COLUMN start_date DATE;
ALTER TABLE programme ADD COLUMN end_date DATE;
ALTER TABLE programme ADD COLUMN remark TEXT;

ALTER TABLE programme ADD COLUMN status VARCHAR(20);
UPDATE programme SET status = CASE WHEN is_active THEN 'Active' ELSE 'Close' END;
ALTER TABLE programme ALTER COLUMN status SET NOT NULL;
ALTER TABLE programme ALTER COLUMN status SET DEFAULT 'Active';
ALTER TABLE programme ADD CONSTRAINT chk_programme_status CHECK (
    status IN ('Planned', 'Active', 'On Hold', 'Complete', 'Close')
);

CREATE TABLE programme_state (
    programme_id BIGINT NOT NULL REFERENCES programme(id) ON DELETE CASCADE,
    state_id     BIGINT NOT NULL REFERENCES state_master(id),
    PRIMARY KEY (programme_id, state_id)
);

CREATE TABLE programme_city (
    programme_id BIGINT NOT NULL REFERENCES programme(id) ON DELETE CASCADE,
    city_id      BIGINT NOT NULL REFERENCES city_master(id),
    PRIMARY KEY (programme_id, city_id)
);

CREATE INDEX idx_programme_parent ON programme(parent_programme_id);
CREATE INDEX idx_programme_status ON programme(status);
