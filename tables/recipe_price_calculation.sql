CREATE TABLE recipe_price_calculation (
    id SERIAL PRIMARY KEY,
    recipe_id INT REFERENCES recipes(recipe_id) ON DELETE CASCADE,
    calculated_price DECIMAL(6,2) NOT NULL,
    portion_size INT DEFAULT 1,  
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
