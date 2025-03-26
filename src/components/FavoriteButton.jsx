import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { FaRegStar, FaStar } from "react-icons/fa";

const FavoriteButton = ({ recipeId, userId }) => {
  const [favorited, setFavorited] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if the recipe is already favorited for the current user
  useEffect(() => {
    if (!userId) return;
    async function fetchFavorite() {
      const { data, error } = await supabase
        .from("user_favorites")
        .select("*")
        .eq("user_id", userId)
        .eq("recipe_id", recipeId)
        .single();
      if (data) {
        setFavorited(true);
      } else {
        setFavorited(false);
      }
    }
    fetchFavorite();
  }, [userId, recipeId]);

  // Toggle favorite status: add or remove favorite
  const toggleFavorite = async () => {
    if (!userId) {
      alert("Please log in to favorite recipes");
      return;
    }
    setLoading(true);
    if (favorited) {
      // If already favorited, remove it
      const { error } = await supabase
        .from("user_favorites")
        .delete()
        .eq("user_id", userId)
        .eq("recipe_id", recipeId);
      if (!error) {
        setFavorited(false);
      } else {
        console.error("Error removing favorite:", error);
      }
    } else {
      // If not favorited, add it
      const { error } = await supabase
        .from("user_favorites")
        .insert([
          { 
            user_id: userId, 
            recipe_id: recipeId, 
            favorited_at: new Date().toISOString() 
          }
        ]);
      if (!error) {
        setFavorited(true);
      } else {
        console.error("Error adding favorite:", error);
      }
    }
    setLoading(false);
  };

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      className="focus:outline-none"
      aria-label="Toggle Favorite"
    >
      {favorited ? (
        <FaStar className="text-yellow-500" size={24} />
      ) : (
        <FaRegStar className="text-yellow-500" size={24} />
      )}
    </button>
  );
};

export default FavoriteButton;
