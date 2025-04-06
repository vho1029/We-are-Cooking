import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { FaStar } from "react-icons/fa";
import FavoriteButton from "../components/FavoriteButton";
import { Link } from "react-router-dom";

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

      // Fetches recipes from Spoonacular as a batch
      try {
        const response = await fetch(`https://api.spoonacular.com/recipes/informationBulk?ids=${recipeIds.join(",")}&apiKey=e035ff36a0824d768ead204d0104ec67`);
        const recipes = await response.json();
        setFavorites(recipes);
      } catch (error) {
        console.error("Error fetching recipes from Spoonacular:", error);
      }

      setLoading(false);
    }

    fetchFavoriteRecipes();
  }, [userData?.id]);

  if (!userData?.id) {
    return <p className="text-center text-gray-500">Please log in to see your favorites.</p>;
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
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
        </ul>
      )}
    </div>
  );
};

export default FavoritesPage;
