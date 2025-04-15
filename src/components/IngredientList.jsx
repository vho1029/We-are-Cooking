import React from 'react';
import IngredientCard from './IngredientCard';

const IngredientList = ({ ingredients, userData, recipeId = null, priceData = [] }) => {
  // Merge price data with ingredients if available
  const ingredientsWithPrice = ingredients.map(ingredient => {
    // Find matching price data
    const priceInfo = priceData.find(item => item.name === ingredient.name);
    
    if (priceInfo) {
      return {
        ...ingredient,
        estimatedPrice: priceInfo.estimatedPrice,
        amountInGrams: priceInfo.amountInGrams,
        caloriesPerGram: priceInfo.caloriesPerGram,
        pricePerGram: priceInfo.pricePerGram,
        krogerId: priceInfo.krogerId,
        error: priceInfo.error
      };
    }
    
    return ingredient;
  });

  return (
    <div className="mt-4">
      <h2 className="text-xl font-semibold mb-3">Ingredients</h2>
      {ingredientsWithPrice.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {ingredientsWithPrice.map((ingredient, index) => (
            <IngredientCard
              key={`${ingredient.id || ingredient.name}-${index}`}
              ingredient={ingredient}
              userData={userData}
              recipeId={recipeId}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No ingredients available.</p>
      )}
    </div>
  );
};

export default IngredientList;