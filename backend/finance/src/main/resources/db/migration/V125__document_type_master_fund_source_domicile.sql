-- V125: Each document type declares which Fund Source Domicile(s) it applies
--       to, so the donor form only offers ID types that fit the donor
--       (PAN / Aadhaar for domestic donors, a foreign tax ID for foreign ones).
--       No rows for a type = it applies to both, as for donor types (V92).
CREATE TABLE document_type_master_fund_source_domicile (
    document_type_id     BIGINT NOT NULL REFERENCES document_type_master(id) ON DELETE CASCADE,
    fund_source_domicile VARCHAR(20) NOT NULL,
    PRIMARY KEY (document_type_id, fund_source_domicile)
);

-- Defaults for the six built-in types (V124). Passport ID gets no rows, so it
-- stays available to both domestic and foreign donors.
INSERT INTO document_type_master_fund_source_domicile (document_type_id, fund_source_domicile)
SELECT id, 'DOMESTIC' FROM document_type_master WHERE code IN ('PAN_CARD', 'AADHAAR_CARD', 'VOTER_ID', 'DRIVING_LICENSE')
UNION ALL
SELECT id, 'FOREIGN' FROM document_type_master WHERE code = 'FOREIGN_TAX_ID';
