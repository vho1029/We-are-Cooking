import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getRecipeDetails, getIngredientPrices, saveRecipeToSupabase , getRecipeFromSupabase } from '../api';
import AddToPantryButton from '../components/AddToPantryButton';
import { supabase } from '../supabaseClient';

const RecipeDetails = () => {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [ingredientPrices, setIngredientPrices] = useState([]);
  const [priceLoading, setPriceLoading] = useState(false);

  useEffect(() => {
    // Get user data from session storage
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }

    const fetchRecipeDetails = async () => {
      setLoading(true);
      try {
        const cachedRecipe = await getRecipeFromSupabase(id);

        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - 7);

        const isValidCachedRecipe = cachedRecipe &&
          cachedRecipe.extended_ingredients &&
          cachedRecipe.analyzed_instructions &&
          cachedRecipe.total_price &&
          cachedRecipe.nutrition &&
          new Date(cachedRecipe.created_at) > daysAgo;

        if (isValidCachedRecipe) {
          const normalized = {
            ...cachedRecipe,
            extendedIngredients: cachedRecipe.extended_ingredients,
            analyzedInstructions: cachedRecipe.analyzed_instructions,
            nutrition: cachedRecipe.nutrition && typeof cachedRecipe.nutrition === 'string'
              ? JSON.parse(cachedRecipe.nutrition)
              : cachedRecipe.nutrition
          };

          const cachedPrices = normalized.extendedIngredients
            .filter(ing => ing.estimatedPrice !== undefined)
            .map(ing => ({
              name: ing.name,
              estimatedPrice: ing.estimatedPrice,
              amountInGrams: ing.amountInGrams,
              caloriesPerGram: ing.caloriesPerGram,
              pricePerGram: ing.pricePerGram,
              krogerId: ing.krogerId,
              error: ing.error
            }));
        
          setRecipe(normalized);
          setTotalPrice(cachedRecipe.total_price || 0);
          setIngredientPrices(cachedPrices);
          setLoading(false);
          return;
        }
        const recipe = await getRecipeDetails(id);
        setRecipe(recipe);
        
        // After getting recipe details, fetch price data
        setPriceLoading(true);
        const prices = await getIngredientPrices(recipe.extendedIngredients);
        setIngredientPrices(prices);
        
        // Calculate total price
        const calculatedTotal = prices.reduce((sum, item) => {
          return sum + (item.estimatedPrice || 0);
        }, 0);
        setTotalPrice(calculatedTotal);

        if (recipe.extendedIngredients && prices.length === recipe.extendedIngredients.length) {
          recipe.extendedIngredients = recipe.extendedIngredients.map((ingredient, i) => ({
            ...ingredient,
            estimatedPrice: prices[i].estimatedPrice
          }));
        }
        
        // Save recipe with price to Supabase
        await saveRecipeToSupabase(recipe, calculatedTotal);
        
        setPriceLoading(false);
      } catch (error) {
        console.error('Error fetching recipe details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRecipeDetails();
    }
  }, [id]);

  // Function to get price info for an ingredient
  const getIngredientPriceInfo = (ingredient) => {
    const priceInfo = ingredientPrices.find(item => item.name === ingredient.name);
    return priceInfo;
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  if (loading) {
    return <div className="text-center p-8">Loading recipe details...</div>;
  }

  if (!recipe) {
    return <div className="text-center p-8">Recipe not found.</div>;
  }

  // Remove HTML tags from summary
  const cleanSummary = recipe.summary?.replace(/<\/?[^>]+(>|$)/g, '');

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Recipe Header */}
        <div className="relative">
          {recipe.image && (
            <img 
              src={recipe.image} 
              alt={recipe.title} 
              className="w-full h-64 object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
            <div className="p-6 text-white">
              <h1 className="text-2xl md:text-3xl font-bold">{recipe.title}</h1>
              <div className="flex items-center mt-2 space-x-4">
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
                  </svg>
                  {recipe.readyInMinutes} min
                </span>
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  {recipe.servings} servings
                </span>
                {totalPrice > 0 && (
                  <span className="flex items-center font-semibold">
                    {formatCurrency(totalPrice)} total
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recipe Content */}
        <div className="p-6">
          {/* Summary */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">About</h2>
            <p className="text-gray-700">{cleanSummary}</p>
          </div>

          {/* Ingredients with Add to Pantry button */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-3">Ingredients</h2>
            <div className="space-y-3">
              {recipe.extendedIngredients.map((ingredient, index) => {
                const priceInfo = getIngredientPriceInfo(ingredient);
                
                // Merge price info with ingredient if available
                const enrichedIngredient = priceInfo ? {
                  ...ingredient,
                  estimatedPrice: priceInfo.estimatedPrice,
                  amountInGrams: priceInfo.amountInGrams,
                  caloriesPerGram: priceInfo.caloriesPerGram,
                  pricePerGram: priceInfo.pricePerGram,
                  krogerId: priceInfo.krogerId,
                  error: priceInfo.error
                } : ingredient;
                
                return (
                  <div 
                    key={`${ingredient.id || ingredient.name}-${index}`} 
                    className="flex justify-between items-center py-3 px-4 border rounded-lg bg-gray-50"
                  >
                    <div>
                      <h3 className="font-medium text-gray-800">{ingredient.name}</h3>
                      <p className="text-sm text-gray-600">
                        {ingredient.amount} {ingredient.unit}
                      </p>
                      
                      {/* Display price if available */}
                      {priceInfo?.estimatedPrice && (
                        <p className="text-sm font-semibold text-green-600 mt-1">
                          {formatCurrency(priceInfo.estimatedPrice)}
                        </p>
                      )}
                      
                      {/* Display error if there was a pricing issue */}
                      {priceInfo?.error && (
                        <p className="text-xs text-red-500 mt-1">
                          {priceInfo.error}
                        </p>
                      )}
                    </div>
                    
                    {/* Add to Pantry button */}
                    <AddToPantryButton 
                      ingredient={enrichedIngredient} 
                      userId={userData?.id} 
                      recipeId={recipe.id}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-3">Instructions</h2>
            {recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0 ? (
              <ol className="list-decimal list-inside space-y-2 text-left">
                {recipe.analyzedInstructions[0].steps.map((step) => (
                  <li key={step.number} className="ml-4 pl-2 text-gray-700">
                    {step.step}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-gray-500">No instructions available.</p>
            )}
          </div>

          {/* Nutrition Info */}
          {recipe.nutrition && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-3">Nutrition</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {recipe.nutrition.nutrients.slice(0, 8).map((nutrient) => (
                  <div key={nutrient.name} className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">{nutrient.name}</p>
                    <p className="text-lg font-semibold">
                      {nutrient.amount} {nutrient.unit}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeDetails;