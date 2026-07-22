-- V27: Seed a second district + major city for the states that only had one
INSERT INTO district_master (district_code, district_name, state_id)
SELECT v.district_code, v.district_name, s.id
FROM (VALUES
    ('AP', 'AP-002', 'Vijayawada'),
    ('AR', 'AR-002', 'Naharlagun'),
    ('AS', 'AS-002', 'Dibrugarh'),
    ('BR', 'BR-002', 'Gaya'),
    ('CT', 'CT-002', 'Bhilai'),
    ('GA', 'GA-002', 'Margao'),
    ('HR', 'HR-002', 'Faridabad'),
    ('HP', 'HP-002', 'Dharamshala'),
    ('JK', 'JK-002', 'Jammu'),
    ('JH', 'JH-002', 'Jamshedpur'),
    ('KL', 'KL-002', 'Thiruvananthapuram'),
    ('MP', 'MP-002', 'Bhopal'),
    ('MN', 'MN-002', 'Thoubal'),
    ('ML', 'ML-002', 'Tura'),
    ('MZ', 'MZ-002', 'Lunglei'),
    ('NL', 'NL-002', 'Dimapur'),
    ('OD', 'OD-002', 'Cuttack'),
    ('PB', 'PB-002', 'Amritsar'),
    ('RJ', 'RJ-002', 'Jodhpur'),
    ('SK', 'SK-002', 'Namchi'),
    ('TG', 'TG-002', 'Warangal'),
    ('TR', 'TR-002', 'Dharmanagar'),
    ('UP', 'UP-002', 'Kanpur'),
    ('UK', 'UK-002', 'Haridwar'),
    ('WB', 'WB-002', 'Howrah')
) AS v(state_code, district_code, district_name)
JOIN state_master s ON s.state_code = v.state_code
WHERE NOT EXISTS (SELECT 1 FROM district_master d WHERE d.district_code = v.district_code);

INSERT INTO city_master (city_code, city_name, district_id)
SELECT v.city_code, v.city_name, d.id
FROM (VALUES
    ('AP-002', 'AP-002-001', 'Vijayawada'),
    ('AR-002', 'AR-002-001', 'Naharlagun'),
    ('AS-002', 'AS-002-001', 'Dibrugarh'),
    ('BR-002', 'BR-002-001', 'Gaya'),
    ('CT-002', 'CT-002-001', 'Bhilai'),
    ('GA-002', 'GA-002-001', 'Margao'),
    ('HR-002', 'HR-002-001', 'Faridabad'),
    ('HP-002', 'HP-002-001', 'Dharamshala'),
    ('JK-002', 'JK-002-001', 'Jammu'),
    ('JH-002', 'JH-002-001', 'Jamshedpur'),
    ('KL-002', 'KL-002-001', 'Thiruvananthapuram'),
    ('MP-002', 'MP-002-001', 'Bhopal'),
    ('MN-002', 'MN-002-001', 'Thoubal'),
    ('ML-002', 'ML-002-001', 'Tura'),
    ('MZ-002', 'MZ-002-001', 'Lunglei'),
    ('NL-002', 'NL-002-001', 'Dimapur'),
    ('OD-002', 'OD-002-001', 'Cuttack'),
    ('PB-002', 'PB-002-001', 'Amritsar'),
    ('RJ-002', 'RJ-002-001', 'Jodhpur'),
    ('SK-002', 'SK-002-001', 'Namchi'),
    ('TG-002', 'TG-002-001', 'Warangal'),
    ('TR-002', 'TR-002-001', 'Dharmanagar'),
    ('UP-002', 'UP-002-001', 'Kanpur'),
    ('UK-002', 'UK-002-001', 'Haridwar'),
    ('WB-002', 'WB-002-001', 'Howrah')
) AS v(district_code, city_code, city_name)
JOIN district_master d ON d.district_code = v.district_code
WHERE NOT EXISTS (SELECT 1 FROM city_master c WHERE c.city_code = v.city_code);
