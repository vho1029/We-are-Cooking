//import React, { useState } from "react";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const MealPlanButton = ({ recipeId, userId }) => {
  const [mealType, setMealType] = useState("breakfast");
  const [scheduledDate, setScheduledDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleAddToMealPlan = async () => {
    if (!userId) {
      alert("Please log in to add to your meal plan.");
      return;
    }
    if (!scheduledDate) {
      alert("Please select a date.");
      return;
    }
    setLoading(true);
    setSuccessMsg("");
    const { error } = await supabase
      .from("user_meal_plans")
      .insert([
        {
          user_id: userId,
          spoonacular_id: recipeId,
          meal_type: mealType,
          scheduled_date: scheduledDate,
        },
      ]);

    if (error) {
      console.error("Error adding to meal plan:", error.message);
      alert("Failed to add to meal plan.");
    } else {
      setSuccessMsg("Added to meal plan!");
    }

    setLoading(false);
  };

  return (
    <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-2">
      <select
        value={mealType}
        onChange={(e) => setMealType(e.target.value)}
        className="p-2 border border-gray-300 rounded-md bg-white text-gray-700"
      >
        <option value="breakfast">Breakfast</option>
        <option value="lunch">Lunch</option>
        <option value="dinner">Dinner</option>
        <option value="snack">Snack</option>
      </select>
      <input
        type="date"
        value={scheduledDate}
        onChange={(e) => setScheduledDate(e.target.value)}
        className="p-2 border border-gray-300 rounded-md text-gray-700"
      />
      <button
        onClick={handleAddToMealPlan}
        disabled={loading}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition disabled:opacity-60"
      >
        {loading ? "Adding..." : "Add to Meal Plan"}
      </button>
      {successMsg && (
        <span className="text-green-600 text-sm font-medium ml-2">
          {successMsg}
        </span>
      )}
    </div>
  );
};

export default MealPlanButton;
