import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getRecipeDetails } from "../api";
import { getIngredientPrices } from "../api";


export default function RecipeDetails() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ingredientPrices, setIngredientPrices] = useState([]);


  useEffect(() => {
    async function fetchDetails() {
      try {
        const data = await getRecipeDetails(id);
        if (!data || data.status === "failure") {
          setError("No recipe details found.");
        } else {
          setRecipe(data);
          if (data.extendedIngredients) {
            const priceData = await getIngredientPrices(data.extendedIngredients);
            setIngredientPrices(priceData);
          }          
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!recipe) return <div>No recipe details available.</div>;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      {/* Back to Recipes Link */}
      <Link to="/Dashboard" className="text-blue-600 hover:underline">
        &larr; Back to Recipes
      </Link>

      {/* Title, Image, Basic Info */}
      <h2 className="text-3xl font-bold mt-4 mb-2">{recipe.title}</h2>
      {recipe.image && (
        <img
          src={recipe.image}
          alt={recipe.title}
          className="w-full max-w-md mb-4"
        />
      )}
      <p className="text-gray-700 mb-4">
        <strong>Servings:</strong> {recipe.servings} &nbsp;|&nbsp; 
        <strong>Ready in:</strong> {recipe.readyInMinutes} minutes
      </p>

      {/* Ingredients */}
      {recipe.extendedIngredients && (
        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Ingredients</h3>
          <ul className="list-disc list-inside">
            {recipe.extendedIngredients.map((ing, idx) => {
              const priceInfo = ingredientPrices.find(p => p.name.toLowerCase() === ing.name.toLowerCase());
              return (
                <li key={ing.id}>
                  {ing.original}
                  {priceInfo && priceInfo.estimatedPrice && (
                    <span className="text-sm text-gray-600"> — ${priceInfo.estimatedPrice.toFixed(2)}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Instructions: step-by-step (analyzedInstructions) */}
      {recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0 ? (
        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Instructions</h3>
          {recipe.analyzedInstructions.map((instr, idx) => (
            <div key={idx} className="mb-4">
              {/* Some recipes have a name for instruction sets (like "Sauce" or "Pasta") */}
              {instr.name && <h4 className="font-semibold">{instr.name}</h4>}
              <ol className="list-decimal list-inside space-y-1">
                {instr.steps.map((step) => (
                  <li key={step.number}>{step.step}</li>
                ))}
              </ol>
            </div>
          ))}
        </section>
      ) : (
        // If no analyzedInstructions, fall back to plain HTML instructions
        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Instructions</h3>
          {recipe.instructions ? (
            <div
              className="prose"
              dangerouslySetInnerHTML={{ __html: recipe.instructions }}
            />
          ) : (
            <p>No instructions provided.</p>
          )}
        </section>
      )}

      {/* Nutrition Info */}
      {recipe.nutrition && recipe.nutrition.nutrients && (
        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Nutrition (Per Serving)</h3>
          <ul className="list-disc list-inside">
            {recipe.nutrition.nutrients.map((nutrient) => (
              <li key={nutrient.name}>
                {nutrient.name}: {nutrient.amount}
                {nutrient.unit} ({nutrient.percentOfDailyNeeds}% DV)
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Wine Pairing */}
      {recipe.winePairing && recipe.winePairing.pairedWines && (
        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Wine Pairing</h3>
          <p>{recipe.winePairing.pairingText}</p>
          {recipe.winePairing.productMatches && (
            <ul className="list-disc list-inside mt-2">
              {recipe.winePairing.productMatches.map((wine) => (
                <li key={wine.id}>
                  <strong>{wine.title}</strong> - {wine.description}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
