import React, { useState } from "react";
import { Link } from "react-router-dom";
import { fetchFilteredRecipes } from "../api";
import FavoriteButton from "./FavoriteButton";

const RecipeSearch = ({ userData }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [diet, setDiet] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [mealType, setMealType] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [message, setMessage] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();

    // Build query parameters
    const params = new URLSearchParams({
      apiKey: "e035ff36a0824d768ead204d0104ec67",
      query: searchTerm,
      number: 10,
    });

    if (diet) params.append("diet", diet);
    if (cuisine) params.append("cuisine", cuisine);
    if (mealType) params.append("type", mealType);

    try {
      const response = await fetch(
        `https://api.spoonacular.com/recipes/complexSearch?${params.toString()}`
      );
      const data = await response.json();

      if (!response.ok) {
        setMessage(`API Error: ${data.message || response.status}`);
        setRecipes([]);
        return;
      }

      if (!data.results || data.results.length === 0) {
        setMessage("No recipes found. Try different filters.");
        setRecipes([]);
      } else {
        setMessage("");
        setRecipes(data.results);
      }
    } catch (error) {
      console.error("Error fetching recipes:", error);
      setMessage("Error fetching recipes. Please try again.");
      setRecipes([]);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <h2 className="text-xl font-bold text-slate-800">Search Recipes</h2>
      <form onSubmit={handleSearch} className="mt-4 space-y-3">
        <input
          type="text"
          placeholder="Search recipes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
          required
        />
        <div className="flex flex-wrap gap-3">
          <select
            value={diet}
            onChange={(e) => setDiet(e.target.value)}
            className="p-2.5 border border-gray-300 rounded-md bg-white text-gray-700 cursor-pointer"
          >
            <option value="">All Diets</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="vegan">Vegan</option>
            <option value="paleo">Paleo</option>
            <option value="ketogenic">Ketogenic</option>
          </select>
          <select
            value={cuisine}
            onChange={(e) => setCuisine(e.target.value)}
            className="p-2.5 border border-gray-300 rounded-md bg-white text-gray-700 cursor-pointer"
          >
            <option value="">All Cuisines</option>
            <option value="italian">Italian</option>
            <option value="mexican">Mexican</option>
            <option value="chinese">Chinese</option>
            <option value="indian">Indian</option>
          </select>
          <select
            value={mealType}
            onChange={(e) => setMealType(e.target.value)}
            className="p-2.5 border border-gray-300 rounded-md bg-white text-gray-700 cursor-pointer"
          >
            <option value="">All Meal Types</option>
            <option value="main course">Main Course</option>
            <option value="side dish">Side Dish</option>
            <option value="dessert">Dessert</option>
            <option value="snack">Snack</option>
          </select>
        </div>
        <button 
          type="submit" 
          className="bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-md transition duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Search
        </button>
      </form>
      {message && <p className="mt-3 text-red-500 font-medium">{message}</p>}
      <div className="mt-6 space-y-4">
        {recipes.map((recipe, index) => (
          <div key={`${recipe.id}-${index}`} className="border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
            <h3 className="font-bold text-lg text-gray-800">{recipe.title}</h3>
            {recipe.image && (
              <img
                src={recipe.image}
                alt={recipe.title}
                className="w-32 h-32 object-cover mt-2 rounded-md"
              />
            )}
            <div className="flex items-center justify-between mt-3">
              <FavoriteButton recipeId={recipe.id} userId={userData?.id} />
              <Link 
                to={`/recipe/${recipe.id}`}
                className="text-blue-600 hover:underline"
              >
                View Recipe
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecipeSearch;
