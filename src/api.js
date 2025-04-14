const API_KEY = "976f04b59d734caeafd144893576ca1a";
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

// Get random recipes for recommendations
export const getRandomRecipes = async (number = 6, tags = "") => {
  try {
    const params = new URLSearchParams({
      apiKey: API_KEY,
      number: number,
    });
    
    if (tags) params.append("tags", tags);
    
    const response = await fetch(
      `${BASE_URL}/recipes/random?${params.toString()}`
    );
    const data = await response.json();
    return data.recipes || [];
  } catch (error) {
    console.error("Error fetching random recipes:", error);
    return [];
  }
};

// Get similar recipes
export const getSimilarRecipes = async (id, number = 4) => {
  try {
    const response = await fetch(
      `${BASE_URL}/recipes/${id}/similar?apiKey=${API_KEY}&number=${number}`
    );
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error(`Error fetching similar recipes for ${id}:`, error);
    return [];
  }
};

// Search recipes by ingredients
export const searchByIngredients = async (ingredients, number = 10) => {
  try {
    const ingredientsList = ingredients.join(',');
    const response = await fetch(
      `${BASE_URL}/recipes/findByIngredients?ingredients=${ingredientsList}&number=${number}&apiKey=${API_KEY}`
    );
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('Error searching recipes by ingredients:', error);
    return [];
  }
};

// Get recipe nutrition widget
export const getNutritionWidget = async (id) => {
  try {
    const response = await fetch(
      `${BASE_URL}/recipes/${id}/nutritionWidget.json?apiKey=${API_KEY}`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching nutrition widget for recipe ${id}:`, error);
    return null;
  }
};

// Get recipe equipment
export const getRecipeEquipment = async (id) => {
  try {
    const response = await fetch(
      `${BASE_URL}/recipes/${id}/equipmentWidget.json?apiKey=${API_KEY}`
    );
    const data = await response.json();
    return data.equipment || [];
  } catch (error) {
    console.error(`Error fetching equipment for recipe ${id}:`, error);
    return [];
  }
};

// Auto-complete recipe search
export const autocompleteRecipeSearch = async (query, number = 5) => {
  try {
    const response = await fetch(
      `${BASE_URL}/recipes/autocomplete?query=${query}&number=${number}&apiKey=${API_KEY}`
    );
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('Error autocompleting recipe search:', error);
    return [];
  }
};