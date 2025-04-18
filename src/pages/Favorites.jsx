import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { FaStar } from "react-icons/fa";
import FavoriteButton from "../components/FavoriteButton";
import { Link } from "react-router-dom";
import MealPlanButton from "../components/MealPlanButton";

const FavoritesPage = ({ userData }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userData?.id) return;

    async function fetchFavoriteRecipes() {
      setLoading(true);

      // Fetches all favorited recipe IDs for the user, mathing for user's id
      const { data: favoriteData, error: favoriteError } = await supabase
        .from("user_favorites")
        .select("recipe_id")
        .eq("user_id", userData.id);

      if (favoriteError) {
        console.error("Error fetching favorite recipe IDs:", favoriteError);
        setLoading(false);
        return;
      }

      const recipeIds = favoriteData.map(fav => fav.recipe_id);
      if (recipeIds.length === 0) {
        setFavorites([]);
        setLoading(false);
        return;
      }

      const { data: cachedRecipes = [], error: cachedError } = await supabase
        .from("test_recipes")
        .select("spoonacular_id, title, image, extended_ingredients, analyzed_instructions, nutrition")
        .in("spoonacular_id", recipeIds); 
      
      if (cachedError) {
        console.error("Error fetching from test_recipes:", cachedError);
        setError("Failed to fetch from cache.");
      }

      const recipeMap = {};
      cachedRecipes.forEach(recipe => {
        recipeMap[recipe.spoonacular_id] = recipe;
      });

      // Identify which recipes are missing or incomplete
      const missingOrIncompleteIds = recipeIds.filter(id => {
        const r = recipeMap[id];
        return (
          !r ||
          !r.extended_ingredients ||
          !r.analyzed_instructions ||
          !r.nutrition
        );
      });

      let spoonacularRecipes = [];
      if (missingOrIncompleteIds.length > 0) {
        try {
          const response = await fetch(`https://api.spoonacular.com/recipes/informationBulk?ids=${missingOrIncompleteIds.join(",")}&apiKey=0e2a083a8ead436e883e2e9f3f135f83`);
          spoonacularRecipes = await response.json();
        } catch (err) {
          console.error("Error fetching from Spoonacular:", err);
          setError("Some recipes could not be loaded.");
        }
      }

      // Combine cached and fetched recipes
      const fullRecipes = recipeIds.map(id => {
        return recipeMap[id] || spoonacularRecipes.find(r => r.id === id);
      }).filter(Boolean); // Remove any nulls just in case

      setFavorites(fullRecipes);
      setLoading(false);
    }

    fetchFavoriteRecipes();
  }, [userData?.id]);

  if (!userData?.id) {
    return <p className="text-center text-gray-500">Please log in to see your favorites.</p>;
  }

  if (loading) {
    return <p className="text-center text-gray-500">Loading favorites...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  if (favorites.length === 0) {
    return <p className="text-center text-gray-500">No favorites yet.</p>;
  }

  return (
    <div className="p-4 w-full">
      <h2 className="text-2xl font-bold mb-4">Your Favorites</h2>
      {loading ? (
        <p>Loading...</p>
      ) : favorites.length === 0 ? (
        <p className="text-gray-500">No favorite recipes yet.</p>
      ) : (
        <ul className="space-y-4">
          {favorites.map((recipe, index) => (
            <div key={`${recipe.id}-${index}`} className="border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
              <h3 className="font-bold text-lg text-gray-800">{recipe.title}</h3>
              {recipe.image && (
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  className="w-32 h-32 object-cover mt-2 rounded-md"
                />
              )}
              <div className="flex flex-wrap items-center justify-between mt-4 gap-4">
                <div className="flex items-center gap-x-4">
                  <FavoriteButton
                    recipeId={recipe.spoonacular_id || recipe.id}
                    userId={userData?.id}
                    initialFavorite={true}
                  />
                  <MealPlanButton
                    recipeId={recipe.spoonacular_id || recipe.id}
                    userId={userData?.id}
                  />
                </div>
                <Link
                  to={`/recipe/${recipe.spoonacular_id || recipe.id}`}
                  className="text-blue-600 hover:underline"
                >
                  View Recipe
                </Link>
              </div>
            </div>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FavoritesPage;
