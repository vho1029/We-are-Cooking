CREATE TABLE recipes (
    recipe_id INT PRIMARY KEY, 
    title VARCHAR(255) NOT NULL,
    instructions TEXT,
    image_url TEXT,
    cooking_time INT,
    servings INT,
    source_url TEXT,
    created_by INT REFERENCES users(user_id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
