-- V92: Donor Type master no longer carries a manual "code" — its auto id is
--      the stable identifier, and donor_master now references it by FK
--      instead of storing a free-text code. Each donor type also now
--      declares which Fund Source Domicile(s) and Contribution Type(s) are
--      valid for it, so the donor form can constrain those fields based on
--      the chosen donor type.
CREATE TABLE donor_type_master_fund_source_domicile (
    donor_type_id        BIGINT NOT NULL REFERENCES donor_type_master(id) ON DELETE CASCADE,
    fund_source_domicile VARCHAR(20) NOT NULL,
    PRIMARY KEY (donor_type_id, fund_source_domicile)
);

CREATE TABLE donor_type_master_contribution_type (
    donor_type_id     BIGINT NOT NULL REFERENCES donor_type_master(id) ON DELETE CASCADE,
    contribution_type VARCHAR(20) NOT NULL,
    PRIMARY KEY (donor_type_id, contribution_type)
);

-- Sensible defaults for the four bootstrapped donor types (V91): Corporate
-- CSR and Government are domestic/local-only; Individual and Foundation can
-- be either.
INSERT INTO donor_type_master_fund_source_domicile (donor_type_id, fund_source_domicile)
SELECT id, 'DOMESTIC' FROM donor_type_master WHERE code = 'CORPORATE'
UNION ALL SELECT id, 'DOMESTIC' FROM donor_type_master WHERE code = 'INDIVIDUAL'
UNION ALL SELECT id, 'FOREIGN'  FROM donor_type_master WHERE code = 'INDIVIDUAL'
UNION ALL SELECT id, 'DOMESTIC' FROM donor_type_master WHERE code = 'FOUNDATION'
UNION ALL SELECT id, 'FOREIGN'  FROM donor_type_master WHERE code = 'FOUNDATION'
UNION ALL SELECT id, 'DOMESTIC' FROM donor_type_master WHERE code = 'GOVERNMENT';

INSERT INTO donor_type_master_contribution_type (donor_type_id, contribution_type)
SELECT id, 'LC' FROM donor_type_master WHERE code = 'CORPORATE'
UNION ALL SELECT id, 'LC' FROM donor_type_master WHERE code = 'INDIVIDUAL'
UNION ALL SELECT id, 'FC' FROM donor_type_master WHERE code = 'INDIVIDUAL'
UNION ALL SELECT id, 'LC' FROM donor_type_master WHERE code = 'FOUNDATION'
UNION ALL SELECT id, 'FC' FROM donor_type_master WHERE code = 'FOUNDATION'
UNION ALL SELECT id, 'LC' FROM donor_type_master WHERE code = 'GOVERNMENT';

-- donor_master.donor_type (free-text code) -> donor_master.donor_type_id (FK).
ALTER TABLE donor_master ADD COLUMN donor_type_id BIGINT;

UPDATE donor_master dm
SET donor_type_id = dtm.id
FROM donor_type_master dtm
WHERE dm.donor_type = dtm.code;

ALTER TABLE donor_master ALTER COLUMN donor_type_id SET NOT NULL;
ALTER TABLE donor_master ADD CONSTRAINT fk_donor_master_donor_type
    FOREIGN KEY (donor_type_id) REFERENCES donor_type_master(id);

ALTER TABLE donor_master DROP COLUMN donor_type;

-- id is now the stable identifier; the manual code is no longer needed.
ALTER TABLE donor_type_master DROP COLUMN code;
