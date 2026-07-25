-- V25: Seed major city for each district that has none yet
INSERT INTO city_master (city_code, city_name, district_id)
SELECT v.city_code, v.city_name, d.id
FROM (VALUES
    ('MH-003-001', 'Nagpur City', 'MH-003'),
    ('DL-001-001', 'New Delhi City', 'DL-001'),
    ('KA-002-001', 'Mysore City', 'KA-002'),
    ('TN-002-001', 'Madurai City', 'TN-002'),
    ('GJ-002-001', 'Surat City', 'GJ-002')
) AS v(city_code, city_name, district_code)
JOIN district_master d ON d.district_code = v.district_code
WHERE NOT EXISTS (SELECT 1 FROM city_master c WHERE c.city_code = v.city_code);
