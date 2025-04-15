import React from 'react';
import AddToPantryButton from './AddToPantryButton';

const IngredientCard = ({ ingredient, userData, recipeId = null }) => {
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow-custom-light p-4 mb-3">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-gray-800">{ingredient.name}</h3>
          <p className="text-sm text-gray-600">
            {ingredient.amount} {ingredient.unit}
          </p>
          
          {/* Display price if available */}
          {ingredient.estimatedPrice && (
            <p className="text-sm font-semibold text-gray-700 mt-1">
              {formatCurrency(ingredient.estimatedPrice)}
            </p>
          )}
          
          {/* Display error if there was a pricing issue */}
          {ingredient.error && (
            <p className="text-xs text-red-500 mt-1">
              {ingredient.error}
            </p>
          )}
        </div>
        
        {/* Add to Pantry button */}
        <div>
          <AddToPantryButton 
            ingredient={ingredient} 
            userId={userData?.id} 
            recipeId={recipeId}
          />
        </div>
      </div>
    </div>
  );
};

export default IngredientCard;