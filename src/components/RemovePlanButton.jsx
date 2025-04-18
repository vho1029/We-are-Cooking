import { useState } from "react";
import { supabase } from "../supabaseClient";

const RemoveRecipeButton = ({ spoonacularId, userId }) => {
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleRemove = async () => {
    if (!userId || !spoonacularId) {
      alert("Missing user or recipe ID.");
      return;
    }

    setLoading(true);
    setSuccessMsg("");

    try {
      const { data: mealPlanData, error: mealPlanFetchError } = await supabase
        .from("user_meal_plans")
        .select("recipe_id, meal_type, scheduled_date")
        .match({ user_id: userId, spoonacular_id: spoonacularId })
        .single();

      if (mealPlanFetchError || !mealPlanData) {
        console.error("Error fetching from user_meal_plans:", mealPlanFetchError?.message || "No matching data found");
        return;
      }

      const { recipe_id, meal_type, scheduled_date } = mealPlanData;

      const { error: mealHistoryError } = await supabase
        .from("meal_history")
        .insert([
          {
            user_id: userId,
            recipe_id: recipe_id,
            created_at: new Date(),
            spoonacular_id: spoonacularId,
            meal_type: meal_type,
            scheduled_date: scheduled_date
          }
        ]);

      if (mealHistoryError) {
        console.error("Error adding to meal history:", mealHistoryError.message);
      }

      // 1. Delete from pantry where user_id and recipe_id match
      const { error: pantryError } = await supabase
        .from("pantry")
        .delete()
        .match({ user_id: userId, spoonacular_recipe_id: spoonacularId });

      if (pantryError) {
        console.error("Error deleting from pantry:", pantryError.message);
      }



      // 2. Delete from user_meal_plans where spoonacular_id and user_id match
      const { error: mealPlanError } = await supabase
        .from("user_meal_plans")
        .delete()
        .match({ user_id: userId, spoonacular_id: spoonacularId });

      if (mealPlanError) {
        console.error("Error deleting from user_meal_plans:", mealPlanError.message);
      }

      setSuccessMsg("Recipe removed from meal plan and pantry.");
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("Failed to remove recipe.");
    }

    setLoading(false);
  };

  return (
    <div className="mt-2">
      <button
        onClick={handleRemove}
        disabled={loading}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition disabled:opacity-60"
      >
        {loading ? "Removing..." : "Remove Recipe"}
      </button>
      {successMsg && (
        <span className="text-green-600 text-sm font-medium ml-2">{successMsg}</span>
      )}
    </div>
  );
};

export default RemoveRecipeButton;
