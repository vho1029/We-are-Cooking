import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { FaRegHeart, FaHeart } from "react-icons/fa"; // ❤️ Updated import

const FavoriteButton = ({ recipeId, userId }) => {
  const [favorited, setFavorited] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    async function fetchFavorite() {
      const { data } = await supabase
        .from("user_favorites")
        .select("*")
        .eq("user_id", userId)
        .eq("recipe_id", recipeId)
        .single();
      setFavorited(!!data);
    }
    fetchFavorite();
  }, [userId, recipeId]);

  const toggleFavorite = async () => {
    if (!userId) {
      alert("Please log in to favorite recipes");
      return;
    }
    setLoading(true);
    if (favorited) {
      const { error } = await supabase
        .from("user_favorites")
        .delete()
        .eq("user_id", userId)
        .eq("recipe_id", recipeId);
      if (!error) setFavorited(false);
    } else {
      const { error } = await supabase
        .from("user_favorites")
        .insert([
          {
            user_id: userId,
            recipe_id: recipeId,
            favorited_at: new Date().toISOString(),
          },
        ]);
      if (!error) setFavorited(true);
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
        <FaHeart className="text-red-500" size={24} />
      ) : (
        <FaRegHeart className="text-gray-400" size={24} />
      )}
    </button>
  );
};

export default FavoriteButton;
