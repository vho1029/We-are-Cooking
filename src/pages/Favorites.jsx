import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { getRecipeDetails } from "../api";
import { Link } from "react-router-dom";
import { FaHeart } from "react-icons/fa"; // ✅ Heart icon instead of star

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;

      const { data, error } = await supabase
        .from("user_favorites")
        .select("recipe_id")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching favorites:", error.message);
        return;
      }

      const recipes = await Promise.all(
        data.map((entry) => getRecipeDetails(entry.recipe_id))
      );

      setFavorites(recipes.filter(Boolean));
      setLoading(false);
    };

    fetchFavorites();
  }, []);

  const handleRemoveFavorite = async (recipeId) => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;

    const { error } = await supabase
      .from("user_favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("recipe_id", recipeId);

    if (!error) {
      setFavorites((prev) =>
        prev.filter((recipe) => recipe.id !== parseInt(recipeId))
      );
    } else {
      console.error("Failed to remove favorite:", error.message);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <FaHeart className="text-red-500" /> Your Favorite Recipes
      </h2>

      {loading ? (
        <p>Loading favorites...</p>
      ) : favorites.length === 0 ? (
        <p>You have no favorites yet.</p>
      ) : (
        <ul className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {favorites.map((recipe) => (
            <li
              key={recipe.id}
              className="border rounded p-4 shadow hover:shadow-lg transition"
            >
              <h3 className="text-lg font-semibold">{recipe.title}</h3>
              {recipe.image && (
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  className="w-full h-40 object-cover rounded mt-2"
                />
              )}
              <div className="mt-3 flex gap-2">
                <Link
                  to={`/recipe/${recipe.id}`}
                  className="text-blue-600 hover:underline"
                >
                  View Details
                </Link>
                <button
                  onClick={() => handleRemoveFavorite(recipe.id)}
                  className="text-red-600 hover:underline ml-auto"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
