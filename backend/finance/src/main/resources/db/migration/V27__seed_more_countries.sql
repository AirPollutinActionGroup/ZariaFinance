-- V24: Seed additional countries for foreign donor support
INSERT INTO country_master (country_code, country_name) VALUES
    ('US', 'United States'),
    ('GB', 'United Kingdom'),
    ('DE', 'Germany'),
    ('NL', 'Netherlands'),
    ('CH', 'Switzerland'),
    ('SE', 'Sweden'),
    ('NO', 'Norway'),
    ('AU', 'Australia'),
    ('CA', 'Canada'),
    ('JP', 'Japan')
ON CONFLICT (country_code) DO NOTHING;
