const API_KEY = "e035ff36a0824d768ead204d0104ec67";
const BASE_URL = "https://api.spoonacular.com";

export const fetchRecipes = async (query) => {
  try {
    const response = await fetch(
      `${BASE_URL}/recipes/complexSearch?query=${query}&apiKey=${API_KEY}`
    );
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("Error fetching recipes from Spoonacular:", error);
    return [];
  }
};

export const getRecipeDetails = async (id) => {
  try {
    // Include nutrition data & wine pairing
    const response = await fetch(
      `${BASE_URL}/recipes/${id}/information?apiKey=${API_KEY}&includeNutrition=true&addWinePairing=true`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching details for recipe ${id}:`, error);
    return null;
  }
};

export const getMealPlan = async () => {
  try {
    const response = await fetch(
      `${BASE_URL}/mealplanner/generate?timeFrame=week&apiKey=${API_KEY}`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching meal plan:", error);
    return null;
  }
};

export const fetchFilteredRecipes = async ({ query, diet, cuisine, mealType }) => {
  try {
    const params = new URLSearchParams({
      apiKey: API_KEY,
      number: 10,
    });

    if (query) params.append("query", query);
    if (diet) params.append("diet", diet);
    if (cuisine) params.append("cuisine", cuisine);
    if (mealType) params.append("type", mealType);

    const response = await fetch(
      `${BASE_URL}/recipes/complexSearch?${params.toString()}`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching filtered recipes:", error);
    return null;
  }
};
