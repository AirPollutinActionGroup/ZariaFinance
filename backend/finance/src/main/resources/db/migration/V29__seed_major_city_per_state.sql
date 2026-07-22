-- V26: Seed one district + its major city for every state that has none yet
INSERT INTO district_master (district_code, district_name, state_id)
SELECT v.district_code, v.district_name, s.id
FROM (VALUES
    ('AP', 'AP-001', 'Visakhapatnam'),
    ('AR', 'AR-001', 'Itanagar'),
    ('AS', 'AS-001', 'Guwahati'),
    ('BR', 'BR-001', 'Patna'),
    ('CT', 'CT-001', 'Raipur'),
    ('GA', 'GA-001', 'Panaji'),
    ('HR', 'HR-001', 'Gurugram'),
    ('HP', 'HP-001', 'Shimla'),
    ('JK', 'JK-001', 'Srinagar'),
    ('JH', 'JH-001', 'Ranchi'),
    ('KL', 'KL-001', 'Kochi'),
    ('MP', 'MP-001', 'Indore'),
    ('MN', 'MN-001', 'Imphal'),
    ('ML', 'ML-001', 'Shillong'),
    ('MZ', 'MZ-001', 'Aizawl'),
    ('NL', 'NL-001', 'Kohima'),
    ('OD', 'OD-001', 'Bhubaneswar'),
    ('PB', 'PB-001', 'Ludhiana'),
    ('RJ', 'RJ-001', 'Jaipur'),
    ('SK', 'SK-001', 'Gangtok'),
    ('TG', 'TG-001', 'Hyderabad'),
    ('TR', 'TR-001', 'Agartala'),
    ('UP', 'UP-001', 'Lucknow'),
    ('UK', 'UK-001', 'Dehradun'),
    ('WB', 'WB-001', 'Kolkata')
) AS v(state_code, district_code, district_name)
JOIN state_master s ON s.state_code = v.state_code
WHERE NOT EXISTS (SELECT 1 FROM district_master d WHERE d.district_code = v.district_code);

INSERT INTO city_master (city_code, city_name, district_id)
SELECT v.city_code, v.city_name, d.id
FROM (VALUES
    ('AP-001', 'AP-001-001', 'Visakhapatnam'),
    ('AR-001', 'AR-001-001', 'Itanagar'),
    ('AS-001', 'AS-001-001', 'Guwahati'),
    ('BR-001', 'BR-001-001', 'Patna'),
    ('CT-001', 'CT-001-001', 'Raipur'),
    ('GA-001', 'GA-001-001', 'Panaji'),
    ('HR-001', 'HR-001-001', 'Gurugram'),
    ('HP-001', 'HP-001-001', 'Shimla'),
    ('JK-001', 'JK-001-001', 'Srinagar'),
    ('JH-001', 'JH-001-001', 'Ranchi'),
    ('KL-001', 'KL-001-001', 'Kochi'),
    ('MP-001', 'MP-001-001', 'Indore'),
    ('MN-001', 'MN-001-001', 'Imphal'),
    ('ML-001', 'ML-001-001', 'Shillong'),
    ('MZ-001', 'MZ-001-001', 'Aizawl'),
    ('NL-001', 'NL-001-001', 'Kohima'),
    ('OD-001', 'OD-001-001', 'Bhubaneswar'),
    ('PB-001', 'PB-001-001', 'Ludhiana'),
    ('RJ-001', 'RJ-001-001', 'Jaipur'),
    ('SK-001', 'SK-001-001', 'Gangtok'),
    ('TG-001', 'TG-001-001', 'Hyderabad'),
    ('TR-001', 'TR-001-001', 'Agartala'),
    ('UP-001', 'UP-001-001', 'Lucknow'),
    ('UK-001', 'UK-001-001', 'Dehradun'),
    ('WB-001', 'WB-001-001', 'Kolkata')
) AS v(district_code, city_code, city_name)
JOIN district_master d ON d.district_code = v.district_code
WHERE NOT EXISTS (SELECT 1 FROM city_master c WHERE c.city_code = v.city_code);
