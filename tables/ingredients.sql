CREATE TABLE ingredients (
    ingredient_id INT PRIMARY KEY, 
    name VARCHAR(255) UNIQUE NOT NULL,
    unit VARCHAR(50),
    calories_per_unit DECIMAL(6,2),
    price_per_unit DECIMAL(6,2),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
