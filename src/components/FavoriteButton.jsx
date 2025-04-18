import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

const FavoriteButton = ({ recipeId, userId, initialFavorite = null }) => {
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [loading, setLoading] = useState(false);

  // Check if recipe is already favorited
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (initialFavorite !== null || !userId || !recipeId) return;

      try {
        // Use the correct syntax for Supabase query
        const { data, error } = await supabase
          .from("user_favorites")
          .select("*")  // Select all columns or just specify "recipe_id"
          .eq("user_id", userId)
          .eq("recipe_id", recipeId)
          .maybeSingle();  // Use maybeSingle() instead of single()

        if (error && error.code !== "PGRST116") {
          // PGRST116 is the error code for "Results contain 0 rows"
          console.error("Error checking favorite status:", error);
        }

        setIsFavorite(!!data); // Convert to boolean
      } catch (err) {
        console.error("Unexpected error checking favorite status:", err);
      }
    };

    checkFavoriteStatus();
  }, [recipeId, userId, initialFavorite]);

  const toggleFavorite = async () => {
    if (!userId) {
      alert("Please log in to save favorites");
      return;
    }

    setLoading(true);
    try {
      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from("user_favorites")
          .delete()
          .eq("user_id", userId)
          .eq("recipe_id", recipeId);

        if (error) throw error;
        setIsFavorite(false);
      } else {
        // Add to favorites
        const { error } = await supabase
          .from("user_favorites")
          .insert([{ user_id: userId, recipe_id: recipeId }]);

        if (error) throw error;
        setIsFavorite(true);
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading || !userId}
      className={`flex items-center ${
        isFavorite
          ? "text-red-500 hover:text-red-600"
          : "text-gray-400 hover:text-red-500"
      } transition-colors duration-200 disabled:opacity-50`}
      title={userId ? "Add to favorites" : "Log in to save favorites"}
    >
      <svg
        className="w-5 h-5"
        fill={isFavorite ? "currentColor" : "none"}
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        ></path>
      </svg>
      <span className="ml-1">{isFavorite ? "Favorited" : "Favorite"}</span>
    </button>
  );
};

export default FavoriteButton;