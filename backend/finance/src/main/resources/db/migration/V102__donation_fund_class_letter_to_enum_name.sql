-- V102: V101 renamed donation.fund_class_code -> fund_class and widened the
-- column, but the entity field is now @Enumerated(STRING) FundClass, which
-- expects the full enum constant name. Existing rows still hold the old
-- plain A/B/C restriction-class letters (see DonorFundProfile.fundClassCode,
-- which uses the same letter convention) — hydrating those rows now throws
-- "No enum constant FundClass.A", breaking every read of the donation table.
UPDATE donation
SET fund_class = CASE fund_class
    WHEN 'A' THEN 'CLASS_A_RESTRICTED'
    WHEN 'B' THEN 'CLASS_B_UNRESTRICTED'
    WHEN 'C' THEN 'CLASS_C_UNRESTRICTED'
    ELSE fund_class
END
WHERE fund_class IN ('A', 'B', 'C');
