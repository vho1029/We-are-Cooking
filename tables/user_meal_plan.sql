CREATE TABLE user_meal_plans (
    plan_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    recipe_id INT REFERENCES recipes(recipe_id) ON DELETE CASCADE,
    meal_type VARCHAR(50),
    scheduled_date DATE NOT NULL
);
