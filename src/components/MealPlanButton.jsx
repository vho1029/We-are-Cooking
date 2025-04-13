//import React, { useState } from "react";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { getRecipeIngredients, getIngredientPrices } from "../api";

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
      setLoading(false);
      return;
    }
    try {
      const rawIngredients = await getRecipeIngredients(recipeId);
      const pricedIngredients = await getIngredientPrices(rawIngredients);
    
      for (let i = 0; i < pricedIngredients.length; i++) {
        const item = pricedIngredients[i];
        const rawName = rawIngredients[i]?.name || "Unnamed ingredient";
        const krogerId = item.krogerId || null; // external_id
        const quantity = item.amountInGrams;
        const price = item.estimatedPrice || 0;
        const ingredientName = rawName || "Unnamed ingredient";
        const unit = "g"; // assuming grams
        const caloriesPerUnit = item.caloriesPerGram || 0;
        const pricePerUnit = (price / quantity) || 0;
        const externalId = krogerId || null; // external_id
        
        console.log("Ingredient data:", item);
        console.log("Price per unit:", pricePerUnit);

        if (!krogerId || !quantity) continue;
    
        // Step 1: Ensure ingredient exists in `ingredient` table
        const { data: existingIngredient, error: ingredientFetchError } = await supabase
          .from("ingredients")
          .select("ingredient_id")
          .eq("external_id", krogerId)
          .single();  // search for ingredient using the external_id (KrogerId)
    
        let ingredientId;
    
        if (ingredientFetchError && ingredientFetchError.code !== "PGRST116") {
          console.error("Error checking ingredient:", ingredientFetchError.message);
          continue;
        }
    
        if (existingIngredient) {
          // If ingredient exists, use its ingredient_id
          ingredientId = existingIngredient.ingredient_id;
        } else {
          // Step 2: Insert into ingredient table if not found
          const { data: inserted, error: insertIngredientError } = await supabase.from("ingredients").insert([{
            name: ingredientName,
            unit,
            calories_per_unit: caloriesPerUnit,
            price_per_unit: pricePerUnit,
            last_updated: new Date().toISOString(),
            external_id: externalId,  // external_id = KrogerId
            spoonacular_id: rawIngredients[i]?.id,
          }]).select("ingredient_id").single();  // get the generated ingredient_id
    
          if (insertIngredientError) {
            console.error("Error inserting new ingredient:", insertIngredientError.message);
            continue;
          }
    
          // Use the newly generated ingredient_id
          ingredientId = inserted.ingredient_id;
        }
    
        // Step 3: Check if ingredient is already in the pantry
        const { data: existingEntry, error: fetchError } = await supabase
          .from("pantry")
          .select("pantry_id, quantity, price")
          .eq("user_id", userId)
          .eq("ingredient_id", ingredientId)
          .single();
    
        if (fetchError && fetchError.code !== "PGRST116") {
          console.error("Error checking pantry:", fetchError.message);
          continue;
        }
    
        if (existingEntry) {
          // Step 3a: Update existing pantry entry
          const updatedQuantity = existingEntry.quantity + quantity;
          const updatedPrice = (existingEntry.price || 0) + price;
    
          const { error: updateError } = await supabase
            .from("pantry")
            .update({
              quantity: updatedQuantity,
              price: updatedPrice,
              added_at: new Date().toISOString(),
            })
            .eq("pantry_id", existingEntry.pantry_id);
    
          if (updateError) {
            console.error("Error updating pantry item:", updateError.message);
          }
        } else {
          // Step 3b: Insert new pantry entry
          const { error: insertError } = await supabase.from("pantry").insert([{
            user_id: userId,
            ingredient_id: ingredientId,  // link to the ingredient
            name: ingredientName,
            quantity,
            unit,
            price,
            added_at: new Date().toISOString(),
            external_id: externalId,  // store the external_id if needed
            spoonacular_id: rawIngredients[i]?.id,
            spoonacular_recipe_id: recipeId,
          }]);
    
          if (insertError) {
            console.error("Error inserting new pantry item:", insertError.message);
          }
        }
      }
    
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
