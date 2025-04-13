//import React, { useState } from "react";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { getRecipeIngredients, getIngredientPrices, insertIngredient, insertPantryItem, getRecipeDetails, addMealPlan, saveRecipeToSupabase } from "../api";

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
    const recipe = await getRecipeDetails(recipeId);
    try {
      const rawIngredients = recipe.extendedIngredients?.map((item) => ({
        id: item.id,
        name: item.name,
        amount: item.amount,
        unit: item.unit,
        original: item.original,
      })) || [];
      console.log("Fetching ingredient pricing");
      const pricedIngredients = await getIngredientPrices(rawIngredients);
      console.log("Finished fetching ingredient pricing");
      let totalPrice = 0;
      for (let i = 0; i < pricedIngredients.length; i++) {
        const item = pricedIngredients[i];
        const quantity = item.amountInGrams;
        const price = item.estimatedPrice || 0;
        const ingredientName = rawIngredients[i]?.name || "Unnamed ingredient";
        const unit = "g"; // assuming grams
        const caloriesPerUnit = item.caloriesPerGram || 0;
        const pricePerUnit = (price / quantity) || 0;
        const externalId = item.krogerId || null; // external_id
        const spoonacularId = rawIngredients[i]?.id;
        totalPrice += price;
        console.log("Ingredient data:", item);
        console.log("Price per unit:", pricePerUnit);

        const ingredientId = await insertIngredient({ingredientName, unit, caloriesPerUnit, pricePerUnit, externalId, spoonacularId});
        await insertPantryItem({userId, ingredientId, ingredientName, quantity, unit, price, externalId, spoonacularId, recipeId});
      }
      const recipeDbId = await saveRecipeToSupabase(recipe, totalPrice);
      await addMealPlan({userId, recipeId, mealType, scheduledDate, recipeDbId});
      setSuccessMsg("Added to meal plan and updated pantry!");
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("Something went wrong with the pantry update.");
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
