import React, { useState } from "react";
import { Link } from "react-router-dom";
import { searchRecipes } from "../services/recipeSearchService";
import FavoriteButton from "./FavoriteButton";
import MealPlanButton from "./MealPlanButton";

const RecipeSearch = ({ userData }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [diet, setDiet] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [mealType, setMealType] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    setMessage("");
    
    try {
      const searchParams = {
        query: searchTerm,
        diet: diet,
        cuisine: cuisine,
        type: mealType,
        maxResults: 10
      };
      
      const results = await searchRecipes(searchParams);
      
      if (!results || results.length === 0) {
        setMessage("No recipes found. Try different search terms or filters.");
        setRecipes([]);
      } else {
        setMessage("");
        setRecipes(results);
      }
    } catch (error) {
      console.error("Error searching recipes:", error);
      setMessage("Error searching recipes. Please try again.");
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0);
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
          className="bg-primary hover:bg-green-600 text-white py-2.5 px-4 rounded-md transition duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          disabled={loading}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>
      {message && <p className="mt-3 text-red-500 font-medium">{message}</p>}
      {loading && (
        <div className="mt-4 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}
      <div className="mt-6 space-y-4">
        {recipes.map((recipe, index) => (
          <div 
            key={`${recipe.id}-${index}`} 
            className="border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 bg-white"
          >
            <h3 className="font-bold text-lg text-gray-800">{recipe.title}</h3>
            {recipe.image && (
              <img
                src={recipe.image}
                alt={recipe.title}
                className="w-32 h-32 object-cover mt-2 rounded-md"
              />
            )}
            {/* Display recipe details */}
            <div className="mt-2 text-sm text-gray-600">
              <span className="mr-4">Ready in {recipe.readyInMinutes} min</span>
              <span>Servings: {recipe.servings}</span>
            </div>
            {/* Display recipe price if available */}
            {recipe.totalPrice > 0 && (
              <p className="mt-2 font-semibold text-gray-700">
                {formatCurrency(recipe.totalPrice)}
              </p>
            )}
            {/* Removed both the badge and any reference to recipe.isFromLocalDb */}
            <div className="flex items-center justify-between mt-3">
              <FavoriteButton recipeId={recipe.id} userId={userData?.id} />
              <MealPlanButton recipeId={recipe.id} userId={userData?.id} />
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