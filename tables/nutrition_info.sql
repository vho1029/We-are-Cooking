CREATE TABLE nutrition_info (
    id SERIAL PRIMARY KEY,
    recipe_id INT REFERENCES recipes(recipe_id) ON DELETE CASCADE,
    calories DECIMAL(6,2),
    protein DECIMAL(6,2),
    carbs DECIMAL(6,2),
    fats DECIMAL(6,2),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
