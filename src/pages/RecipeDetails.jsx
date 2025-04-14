import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getRecipeDetails } from "../api";
import { useGrocery } from "../context/GroceryContext";
import { supabase } from "../supabaseClient";
import FavoriteButton from "../components/FavoriteButton";

function RecipeDetails() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { addIngredients } = useGrocery();
  const userId = JSON.parse(sessionStorage.getItem("user"))?.id;

  useEffect(() => {
    async function fetchDetails() {
      try {
        const data = await getRecipeDetails(Number(id)); // Ensure ID is numeric
        if (!data || data.status === "failure") {
          setError("No recipe details found.");
        } else {
          setRecipe(data);
        }
      } catch (err) {
        console.error("Error fetching recipe details:", err);
        setError("Error fetching recipe details.");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchDetails();
  }, [id]);

  const handleAddToGroceryAndMealPlan = async () => {
    if (!recipe?.extendedIngredients) return;

    try {
      // Add to meal plan
      const { error: mealPlanError } = await supabase
        .from("user_meal_plans")
        .insert([
          {
            user_id: userId,
            spoonacular_id: recipe.id,
            meal_type: "dinner", // Default to dinner
            scheduled_date: new Date().toISOString().split('T')[0] // Today's date
          },
        ]);

      if (mealPlanError) {
        console.error("Failed to add to meal plan:", mealPlanError.message);
        alert("Failed to add to meal plan.");
        return;
      }

      // Add ingredients to grocery list
      const PRICES = {
        onion: 0.003,
        chicken: 0.01,
        garlic: 0.004,
        butter: 0.009,
        salt: 0.002,
      };

      const ingredients = recipe.extendedIngredients.map((ing) => ({
        name: ing.name.toLowerCase(),
        weight: ing.amount * 100,
        price: (ing.amount * 100) * (PRICES[ing.name.toLowerCase()] || 0.005), // Default price if not found
      }));

      await addIngredients(ingredients);
      alert("Added to meal plan and grocery list!");
    } catch (err) {
      console.error("Error adding to meal plan and grocery:", err);
      alert("An error occurred. Please try again.");
    }
  };

  if (loading) return <div className="text-center py-10">Loading recipe details...</div>;
  if (error) return <div className="bg-red-100 text-red-700 p-4 rounded">{error}</div>;
  if (!recipe) return <div className="text-center py-10">Recipe not found</div>;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative">
        <img
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-64 object-cover"
        />
        <Link 
          to="/recipes"
          className="absolute top-4 left-4 bg-white p-2 rounded-full shadow hover:bg-gray-100"
        >
          ← Back
        </Link>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">{recipe.title}</h1>
          <FavoriteButton recipeId={recipe.id} userId={userId} />
        </div>

        <div className="flex flex-wrap gap-4 mb-6 text-sm">
          <div className="bg-blue-100 p-2 rounded">
            <span className="font-bold">Ready in:</span> {recipe.readyInMinutes} minutes
          </div>
          <div className="bg-green-100 p-2 rounded">
            <span className="font-bold">Servings:</span> {recipe.servings}
          </div>
          <div className="bg-yellow-100 p-2 rounded">
            <span className="font-bold">Health Score:</span> {recipe.healthScore}
          </div>
          {recipe.vegetarian && (
            <div className="bg-green-100 p-2 rounded">Vegetarian</div>
          )}
          {recipe.vegan && <div className="bg-green-100 p-2 rounded">Vegan</div>}
          {recipe.glutenFree && (
            <div className="bg-yellow-100 p-2 rounded">Gluten Free</div>
          )}
          {recipe.dairyFree && (
            <div className="bg-yellow-100 p-2 rounded">Dairy Free</div>
          )}
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Summary</h2>
          <div dangerouslySetInnerHTML={{ __html: recipe.summary }} />
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-6">
          <div>
            <h2 className="text-xl font-semibold mb-3">Ingredients</h2>
            <ul className="list-disc pl-5 space-y-2">
              {recipe.extendedIngredients.map((ingredient, index) => (
                <li key={index}>
                  {ingredient.amount} {ingredient.unit} {ingredient.name}
                </li>
              ))}
            </ul>
            <button
              onClick={handleAddToGroceryAndMealPlan}
              className="mt-4 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
            >
              Add to Meal Plan & Grocery List
            </button>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Nutrition Facts</h2>
            {recipe.nutrition && (
              <div className="space-y-2">
                <p>
                  <span className="font-semibold">Calories:</span>{" "}
                  {recipe.nutrition.nutrients.find((n) => n.name === "Calories")?.amount || "N/A"}{" "}
                  kcal
                </p>
                <p>
                  <span className="font-semibold">Protein:</span>{" "}
                  {recipe.nutrition.nutrients.find((n) => n.name === "Protein")?.amount || "N/A"}{" "}
                  g
                </p>
                <p>
                  <span className="font-semibold">Carbs:</span>{" "}
                  {recipe.nutrition.nutrients.find((n) => n.name === "Carbohydrates")?.amount || "N/A"}{" "}
                  g
                </p>
                <p>
                  <span className="font-semibold">Fat:</span>{" "}
                  {recipe.nutrition.nutrients.find((n) => n.name === "Fat")?.amount || "N/A"}{" "}
                  g
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Instructions</h2>
          {recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0 ? (
            <ol className="list-decimal pl-5 space-y-4">
              {recipe.analyzedInstructions[0].steps.map((step) => (
                <li key={step.number}>
                  <div className="font-medium">Step {step.number}</div>
                  <p>{step.step}</p>
                </li>
              ))}
            </ol>
          ) : (
            <div dangerouslySetInnerHTML={{ __html: recipe.instructions }} />
          )}
        </div>

        {recipe.winePairing && recipe.winePairing.pairedWines && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3">Wine Pairing</h2>
            <p className="mb-2">{recipe.winePairing.pairingText}</p>
            <ul className="list-disc pl-5">
              {recipe.winePairing.pairedWines.map((wine, index) => (
                <li key={index}>{wine}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default RecipeDetails;