-- V28: Seed remaining union territories (Delhi and Jammu & Kashmir already existed)
INSERT INTO state_master (state_code, state_name, country_id)
SELECT v.state_code, v.state_name, co.id
FROM (VALUES
    ('AN', 'Andaman and Nicobar Islands'),
    ('CH', 'Chandigarh'),
    ('DN', 'Dadra and Nagar Haveli and Daman and Diu'),
    ('LA', 'Ladakh'),
    ('LD', 'Lakshadweep'),
    ('PY', 'Puducherry')
) AS v(state_code, state_name)
CROSS JOIN (SELECT id FROM country_master WHERE country_code = 'IN') co
WHERE NOT EXISTS (SELECT 1 FROM state_master s WHERE s.state_code = v.state_code);

INSERT INTO district_master (district_code, district_name, state_id)
SELECT v.district_code, v.district_name, s.id
FROM (VALUES
    ('AN', 'AN-001', 'Port Blair'),
    ('CH', 'CH-001', 'Chandigarh'),
    ('DN', 'DN-001', 'Silvassa'),
    ('LA', 'LA-001', 'Leh'),
    ('LD', 'LD-001', 'Kavaratti'),
    ('PY', 'PY-001', 'Puducherry')
) AS v(state_code, district_code, district_name)
JOIN state_master s ON s.state_code = v.state_code
WHERE NOT EXISTS (SELECT 1 FROM district_master d WHERE d.district_code = v.district_code);

INSERT INTO city_master (city_code, city_name, district_id)
SELECT v.city_code, v.city_name, d.id
FROM (VALUES
    ('AN-001', 'AN-001-001', 'Port Blair'),
    ('CH-001', 'CH-001-001', 'Chandigarh'),
    ('DN-001', 'DN-001-001', 'Silvassa'),
    ('LA-001', 'LA-001-001', 'Leh'),
    ('LD-001', 'LD-001-001', 'Kavaratti'),
    ('PY-001', 'PY-001-001', 'Puducherry')
) AS v(district_code, city_code, city_name)
JOIN district_master d ON d.district_code = v.district_code
WHERE NOT EXISTS (SELECT 1 FROM city_master c WHERE c.city_code = v.city_code);
