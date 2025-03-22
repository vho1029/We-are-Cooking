const API_KEY = "e035ff36a0824d768ead204d0104ec67";
const BASE_URL = "https://api.spoonacular.com";

export const fetchRecipes = async (query) => {
  const response = await fetch(`${BASE_URL}/recipes/complexSearch?query=${query}&apiKey=${API_KEY}`);
  const data = await response.json();
  return data.results;
};

export const getRecipeDetails = async (id) => {
  const response = await fetch(`${BASE_URL}/recipes/${id}/information?apiKey=${API_KEY}`);
  const data = await response.json();
  return data;
};

export const getMealPlan = async () => {
  const response = await fetch(`${BASE_URL}/mealplanner/generate?timeFrame=week&apiKey=${API_KEY}`);
  const data = await response.json();
  return data;
};
