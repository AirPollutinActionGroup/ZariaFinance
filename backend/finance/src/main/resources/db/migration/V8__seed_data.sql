-- V8: Seed Data for Master Tables
-- Insert States (Sample data for India)
INSERT INTO state_master (state_code, state_name, is_active) VALUES
('AP', 'Andhra Pradesh', TRUE),
('AR', 'Arunachal Pradesh', TRUE),
('AS', 'Assam', TRUE),
('BR', 'Bihar', TRUE),
('CT', 'Chhattisgarh', TRUE),
('GA', 'Goa', TRUE),
('GJ', 'Gujarat', TRUE),
('HR', 'Haryana', TRUE),
('HP', 'Himachal Pradesh', TRUE),
('JK', 'Jammu & Kashmir', TRUE),
('JH', 'Jharkhand', TRUE),
('KA', 'Karnataka', TRUE),
('KL', 'Kerala', TRUE),
('MP', 'Madhya Pradesh', TRUE),
('MH', 'Maharashtra', TRUE),
('MN', 'Manipur', TRUE),
('ML', 'Meghalaya', TRUE),
('MZ', 'Mizoram', TRUE),
('NL', 'Nagaland', TRUE),
('OD', 'Odisha', TRUE),
('PB', 'Punjab', TRUE),
('RJ', 'Rajasthan', TRUE),
('SK', 'Sikkim', TRUE),
('TN', 'Tamil Nadu', TRUE),
('TG', 'Telangana', TRUE),
('TR', 'Tripura', TRUE),
('UP', 'Uttar Pradesh', TRUE),
('UK', 'Uttarakhand', TRUE),
('WB', 'West Bengal', TRUE),
('DL', 'Delhi', TRUE);

-- Insert sample Districts
INSERT INTO district_master (state_id, district_code, district_name, is_active) VALUES
((SELECT id FROM state_master WHERE state_code = 'MH'), 'MH-001', 'Mumbai', TRUE),
((SELECT id FROM state_master WHERE state_code = 'MH'), 'MH-002', 'Pune', TRUE),
((SELECT id FROM state_master WHERE state_code = 'MH'), 'MH-003', 'Nagpur', TRUE),
((SELECT id FROM state_master WHERE state_code = 'DL'), 'DL-001', 'New Delhi', TRUE),
((SELECT id FROM state_master WHERE state_code = 'KA'), 'KA-001', 'Bangalore', TRUE),
((SELECT id FROM state_master WHERE state_code = 'KA'), 'KA-002', 'Mysore', TRUE),
((SELECT id FROM state_master WHERE state_code = 'TN'), 'TN-001', 'Chennai', TRUE),
((SELECT id FROM state_master WHERE state_code = 'TN'), 'TN-002', 'Madurai', TRUE),
((SELECT id FROM state_master WHERE state_code = 'GJ'), 'GJ-001', 'Ahmedabad', TRUE),
((SELECT id FROM state_master WHERE state_code = 'GJ'), 'GJ-002', 'Surat', TRUE);

-- Insert sample Cities
INSERT INTO city_master (district_id, city_code, city_name, is_active) VALUES
((SELECT id FROM district_master WHERE district_code = 'MH-001'), 'MH-001-001', 'Mumbai', TRUE),
((SELECT id FROM district_master WHERE district_code = 'MH-001'), 'MH-001-002', 'Navi Mumbai', TRUE),
((SELECT id FROM district_master WHERE district_code = 'MH-002'), 'MH-002-001', 'Pune City', TRUE),
((SELECT id FROM district_master WHERE district_code = 'MH-002'), 'MH-002-002', 'Pimpri-Chinchwad', TRUE),
((SELECT id FROM district_master WHERE district_code = 'KA-001'), 'KA-001-001', 'Bangalore City', TRUE),
((SELECT id FROM district_master WHERE district_code = 'TN-001'), 'TN-001-001', 'Chennai City', TRUE),
((SELECT id FROM district_master WHERE district_code = 'GJ-001'), 'GJ-001-001', 'Ahmedabad City', TRUE);

-- Insert sample Programmes
INSERT INTO programme (programme_code, programme_name, description, is_active) VALUES
('PROG-001', 'Health & Nutrition', 'Programme focused on healthcare and nutrition support', TRUE),
('PROG-002', 'Education', 'Educational support and development programme', TRUE),
('PROG-003', 'Skill Development', 'Vocational and skill training programme', TRUE),
('PROG-004', 'Livelihood', 'Income generation and livelihood support', TRUE),
('PROG-005', 'Rural Development', 'Rural area development initiatives', TRUE);

-- Insert sample Reporting Schedules
INSERT INTO reporting_schedule_master (schedule_name, schedule_frequency, description, is_active) VALUES
('Monthly Report', 'MONTHLY', 'Submit reports on monthly basis', TRUE),
('Quarterly Report', 'QUARTERLY', 'Submit reports on quarterly basis', TRUE),
('Half-Yearly Report', 'HALF_YEARLY', 'Submit reports every six months', TRUE),
('Annual Report', 'ANNUAL', 'Submit annual performance report', TRUE);

