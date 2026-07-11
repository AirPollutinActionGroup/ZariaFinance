CREATE TABLE IF NOT EXISTS roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    CONSTRAINT role_name_not_empty CHECK (name != '')
);

CREATE INDEX idx_roles_name ON roles(name);

-- Optional: Insert default roles (uncomment if needed for initial setup)
-- INSERT INTO roles (name) VALUES ('USER'), ('ADMIN'), ('MODERATOR') ON CONFLICT DO NOTHING;
