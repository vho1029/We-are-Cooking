import React, { useState } from "react";
import { Link } from "react-router-dom";
import FavoriteButton from "./FavoriteButton";
import { fetchFilteredRecipes } from "../api";

const RecipeSearch = ({ userData }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [diet, setDiet] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [mealType, setMealType] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const data = await fetchFilteredRecipes({
        query: searchTerm,
        diet: diet,
        cuisine: cuisine,
        mealType: mealType
      });

      if (!data) {
        setMessage("Error connecting to recipe API");
        setRecipes([]);
        return;
      }

      if (data.code === 402) {
        setMessage("API quota exceeded. Please try again later.");
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
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
            <option value="gluten free">Gluten Free</option>
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
            <option value="thai">Thai</option>
            <option value="japanese">Japanese</option>
            <option value="french">French</option>
            <option value="mediterranean">Mediterranean</option>
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
            <option value="appetizer">Appetizer</option>
            <option value="salad">Salad</option>
            <option value="breakfast">Breakfast</option>
            <option value="soup">Soup</option>
            <option value="snack">Snack</option>
          </select>
        </div>
        <button 
          type="submit" 
          className="bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-md transition duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          disabled={loading}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>
      
      {message && <p className="mt-3 text-red-500 font-medium">{message}</p>}
      
      <div className="mt-6 space-y-4">
        {loading ? (
          <p className="text-center py-4">Loading recipes...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recipes.map((recipe) => (
              <div key={recipe.id} className="border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                <h3 className="font-bold text-lg text-gray-800">{recipe.title}</h3>
                {recipe.image && (
                  <img
                    src={recipe.image}
                    alt={recipe.title}
                    className="w-full h-48 object-cover mt-2 rounded-md"
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
        )}
      </div>
    </div>
  );
};

export default RecipeSearch;