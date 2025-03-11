CREATE TABLE user_favorites (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    recipe_id INT REFERENCES recipes(recipe_id) ON DELETE CASCADE,
    favorited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
