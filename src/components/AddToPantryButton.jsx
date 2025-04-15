// src/components/AddToPantryButton.jsx
import React, { useState } from 'react';
import { FaPlus, FaCheck } from 'react-icons/fa';
import { supabase } from '../supabaseClient';
import { insertIngredient, insertPantryItem } from '../api';

const AddToPantryButton = ({ ingredient, userId, recipeId = null }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState(null);

  const handleClick = async () => {
    if (added) return; // Already added
    
    setIsAdding(true);
    setError(null);
    
    try {
      // First, ensure the ingredient exists in the ingredients table
      const ingredientId = await insertIngredient({
        ingredientName: ingredient.name,
        unit: ingredient.unit || 'g',
        caloriesPerUnit: ingredient.caloriesPerGram || 0,
        pricePerUnit: ingredient.pricePerGram || 0,
        externalId: ingredient.krogerId || `${ingredient.name.toLowerCase().replace(/\s+/g, '-')}`,
        spoonacularId: ingredient.id || null
      });
      
      if (!ingredientId) {
        throw new Error('Failed to insert or update ingredient');
      }
      
      // Then add to user's pantry
      await insertPantryItem({
        userId,
        ingredientId,
        ingredientName: ingredient.name,
        quantity: ingredient.amountInGrams || ingredient.amount || 0,
        unit: ingredient.unit || 'g',
        price: ingredient.estimatedPrice || 0,
        externalId: ingredient.krogerId || null,
        spoonacularId: ingredient.id || null,
        spoonacularRecipeId: recipeId || null,
      });
      
      setAdded(true);
      // Reset "added" state after 3 seconds to allow re-adding
      setTimeout(() => {
        setAdded(false);
      }, 3000);
    } catch (error) {
      console.error('Error adding to pantry:', error);
      setError('Failed to add to pantry');
    } finally {
      setIsAdding(false);
    }
  };

  // Display different button states
  if (added) {
    return (
      <button
        className="flex items-center justify-center px-2 py-1 text-sm bg-green-600 text-white rounded"
      >
        <FaCheck className="mr-1" />
        Added!
      </button>
    );
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isAdding}
        className="flex items-center justify-center px-2 py-1 text-sm bg-primary text-white rounded hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        <FaPlus className="mr-1" />
        {isAdding ? 'Adding...' : 'Add to Pantry'}
      </button>
      {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
    </>
  );
};

export default AddToPantryButton;