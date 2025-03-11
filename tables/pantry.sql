CREATE TABLE pantry (
    pantry_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    ingredient_id INT REFERENCES ingredients(ingredient_id) ON DELETE CASCADE,
    quantity DECIMAL(6,2),
    unit VARCHAR(50),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
