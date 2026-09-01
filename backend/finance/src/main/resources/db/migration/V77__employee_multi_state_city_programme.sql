-- V77: Employee State, City and Primary Programme become multi-select,
--      backed by the real geography (state_master/city_master) and
--      programme masters instead of a single free-text state and a single
--      primary_programme_id. Modelled as plain join tables (no city
--      selection existed before, so it starts empty).
CREATE TABLE employee_state (
    employee_id  BIGINT NOT NULL REFERENCES employee(id) ON DELETE CASCADE,
    state_id     BIGINT NOT NULL REFERENCES state_master(id),
    PRIMARY KEY (employee_id, state_id)
);

CREATE TABLE employee_city (
    employee_id  BIGINT NOT NULL REFERENCES employee(id) ON DELETE CASCADE,
    city_id      BIGINT NOT NULL REFERENCES city_master(id),
    PRIMARY KEY (employee_id, city_id)
);

CREATE TABLE employee_programme (
    employee_id  BIGINT NOT NULL REFERENCES employee(id) ON DELETE CASCADE,
    programme_id BIGINT NOT NULL REFERENCES programme(id),
    PRIMARY KEY (employee_id, programme_id)
);

INSERT INTO employee_state (employee_id, state_id)
SELECT e.id, sm.id
FROM employee e
JOIN state_master sm ON sm.state_name = e.state;

INSERT INTO employee_programme (employee_id, programme_id)
SELECT id, primary_programme_id FROM employee WHERE primary_programme_id IS NOT NULL;

ALTER TABLE employee DROP COLUMN state;
ALTER TABLE employee DROP COLUMN primary_programme_id;
