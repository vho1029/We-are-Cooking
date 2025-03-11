CREATE TABLE budget_price_tracking (
    price_id SERIAL PRIMARY KEY,
    ingredient_id INT REFERENCES ingredients(ingredient_id) ON DELETE CASCADE,
    price DECIMAL(6,2) NOT NULL,
    fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
