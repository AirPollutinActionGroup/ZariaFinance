ALTER TABLE donation
    ADD COLUMN other_programme VARCHAR(255);

ALTER TABLE donation_gik_item
    ADD COLUMN quantity          DECIMAL(18, 2),
    ADD COLUMN valuation_basis   VARCHAR(30),
    ADD COLUMN valuation_source  VARCHAR(255),
    ADD COLUMN treatment         VARCHAR(255),
    ADD COLUMN programme_id      BIGINT,
    ADD COLUMN other_programme   VARCHAR(255),
    ADD COLUMN actual_sale_date  DATE,
    ADD COLUMN actual_proceeds   DECIMAL(18, 2),
    ADD COLUMN matching_leg      VARCHAR(255);

ALTER TABLE donation_gik_item
    ADD CONSTRAINT fk_gik_item_programme FOREIGN KEY (programme_id) REFERENCES programme (id);
