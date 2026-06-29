CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255),
    email_id VARCHAR(255) NOT NULL UNIQUE,
    mobile_no VARCHAR(10) NOT NULL UNIQUE,
    username VARCHAR(20) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'USER',
    status BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    CONSTRAINT username_length CHECK (LENGTH(username) >= 4 AND LENGTH(username) <= 20),
    CONSTRAINT password_length CHECK (LENGTH(password) >= 4 AND LENGTH(password) <= 100)
);

CREATE INDEX idx_users_email ON users(email_id);
CREATE INDEX idx_users_username ON users(username);
