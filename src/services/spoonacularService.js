// src/services/spoonacularService.js

const API_KEY = "ff1d2cd7aa95428da9cf7e0c4eb4a224";
const BASE_URL = "https://api.spoonacular.com/recipes/complexSearch";

/**
 * Fetch recipes from Spoonacular with optional filters
 */
export const fetchRecipesFromSpoonacular = async ({
  query,
  diet = "",
  cuisine = "",
  type = "",
  maxResults = 10,
}) => {
  const url = new URL(BASE_URL);
  url.searchParams.set("apiKey", API_KEY);
  url.searchParams.set("query", query);
  url.searchParams.set("addRecipeInformation", "true");
  url.searchParams.set("number", maxResults);

  if (diet) url.searchParams.set("diet", diet);
  if (cuisine) url.searchParams.set("cuisine", cuisine);
  if (type) url.searchParams.set("type", type);

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Spoonacular API fetch failed");
    }

    return data.results || [];
  } catch (err) {
    console.error("❌ Spoonacular fetch error:", err.message);
    return [];
  }
};
