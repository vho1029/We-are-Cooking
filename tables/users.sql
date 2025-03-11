CREATE TYPE user_role AS ENUM ('admin', 'user');

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(50) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role user_role NOT NULL, -- Uses ENUM type
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
