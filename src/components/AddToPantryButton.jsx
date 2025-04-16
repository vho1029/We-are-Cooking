// src/components/AddToPantryButton.jsx
import React, { useState, useEffect } from 'react';
import { FaPlus, FaCheck } from 'react-icons/fa';
import { supabase } from '../supabaseClient';

const AddToPantryButton = ({ ingredient, userId, recipeId = null }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState(null);

  // Check if ingredient is already in pantry on component mount
  useEffect(() => {
    const checkIfInPantry = async () => {
      if (!userId || !ingredient?.name) return;
      
      try {
        // Normalize name to lowercase for case-insensitive matching
        const normalizedName = ingredient.name.toLowerCase().trim();
        
        // Find ingredients with this name for this user
        const { data } = await supabase
          .from('pantry')
          .select('pantry_id, quantity, unit')
          .eq('user_id', userId)
          .ilike('name', normalizedName)
          .maybeSingle();
        
        // If we found it, mark as added
        if (data) {
          console.log(`Found ${normalizedName} in pantry with ID ${data.pantry_id}`);
          setAdded(true);
        } else {
          // Also check by spoonacular_id if available
          if (ingredient.id) {
            const { data: byId } = await supabase
              .from('pantry')
              .select('pantry_id')
              .eq('user_id', userId)
              .eq('spoonacular_id', ingredient.id)
              .maybeSingle();
              
            if (byId) {
              console.log(`Found ${normalizedName} in pantry by spoonacular_id ${ingredient.id}`);
              setAdded(true);
              return;
            }
          }
          
          console.log(`${normalizedName} not found in pantry`);
          setAdded(false);
        }
      } catch (error) {
        console.log("Error checking pantry:", error);
      }
    };
    
    checkIfInPantry();
  }, [userId, ingredient?.name, ingredient?.id]);

  const handleClick = async () => {
    if (!userId) {
      setError("Please log in to add items to your pantry");
      return;
    }
    
    if (!ingredient || !ingredient.name) {
      setError("Invalid ingredient data");
      return;
    }
    
    if (added) {
      console.log(`${ingredient.name} is already in pantry`);
      return; // Already added, no need to add again
    }
    
    setIsAdding(true);
    setError(null);
    
    try {
      // Normalize the data
      const normalizedName = ingredient.name.toLowerCase().trim();
      const amount = parseFloat(ingredient.amount) || 0;
      const unit = ingredient.unit || 'cup';
      const price = ingredient.estimatedPrice || ingredient.price || 0;
      
      console.log(`Adding to pantry: ${normalizedName}, ${amount} ${unit}, price: ${price}`);
      
      // Check if the user already has this ingredient in their pantry (by name)
      const { data: existingPantryItem } = await supabase
        .from('pantry')
        .select('pantry_id, quantity, unit')
        .eq('user_id', userId)
        .ilike('name', normalizedName)
        .maybeSingle();
      
      // If the user already has this ingredient, update the quantity
      if (existingPantryItem) {
        console.log(`Updating existing pantry item: ${existingPantryItem.pantry_id}`);
        
        let newQuantity = existingPantryItem.quantity;
        
        // Only add quantities if units match
        if (existingPantryItem.unit.toLowerCase() === unit.toLowerCase()) {
          newQuantity += amount;
        } else {
          // Units don't match - just keep the larger amount
          newQuantity = Math.max(newQuantity, amount);
        }
        
        const { error: updateError } = await supabase
          .from('pantry')
          .update({ quantity: newQuantity })
          .eq('pantry_id', existingPantryItem.pantry_id);
        
        if (updateError) {
          console.error('Error updating pantry:', updateError);
          throw new Error(`Failed to update pantry: ${updateError.message}`);
        }
        
        setAdded(true);
        return;
      }
      
      // Also check by spoonacular_id if available
      if (ingredient.id) {
        const { data: bySpoonacularId } = await supabase
          .from('pantry')
          .select('pantry_id, quantity, unit')
          .eq('user_id', userId)
          .eq('spoonacular_id', ingredient.id)
          .maybeSingle();
          
        if (bySpoonacularId) {
          console.log(`Updating existing pantry item by spoonacular_id: ${bySpoonacularId.pantry_id}`);
          
          let newQuantity = bySpoonacularId.quantity;
          
          // Only add quantities if units match
          if (bySpoonacularId.unit.toLowerCase() === unit.toLowerCase()) {
            newQuantity += amount;
          } else {
            // Units don't match - just keep the larger amount
            newQuantity = Math.max(newQuantity, amount);
          }
          
          const { error: updateError } = await supabase
            .from('pantry')
            .update({ quantity: newQuantity })
            .eq('pantry_id', bySpoonacularId.pantry_id);
          
          if (updateError) {
            console.error('Error updating pantry:', updateError);
            throw new Error(`Failed to update pantry: ${updateError.message}`);
          }
          
          setAdded(true);
          return;
        }
      }
      
      // If we get here, we need to create a new pantry item
      
      // First, check if this spoonacular_id already exists for any user
      if (ingredient.id) {
        const { data: existingForAnyUser } = await supabase
          .from('pantry')
          .select('pantry_id')
          .eq('spoonacular_id', ingredient.id)
          .maybeSingle();
          
        if (existingForAnyUser) {
          // This means the spoonacular_id is already used, so we need to set it to null
          console.log(`Spoonacular ID ${ingredient.id} already exists in pantry, setting to null`);
          const insertData = {
            user_id: userId,
            name: normalizedName,
            quantity: amount,
            unit: unit,
            price: price,
            added_at: new Date().toISOString(),
            spoonacular_id: null,  // Setting to null to avoid the constraint
            spoonacular_recipe_id: recipeId
          };
          
          const { error: insertError } = await supabase
            .from('pantry')
            .insert([insertData]);
          
          if (insertError) {
            console.error('Error inserting pantry item:', insertError);
            throw new Error(`Failed to add to pantry: ${insertError.message}`);
          }
          
          setAdded(true);
          return;
        }
      }
      
      // Otherwise, insert normally
      const insertData = {
        user_id: userId,
        name: normalizedName,
        quantity: amount,
        unit: unit,
        price: price,
        added_at: new Date().toISOString(),
        spoonacular_id: ingredient.id || null,
        spoonacular_recipe_id: recipeId
      };
      
      const { error: insertError } = await supabase
        .from('pantry')
        .insert([insertData]);
      
      if (insertError) {
        // If we still get a duplicate key error, just set spoonacular_id to null and try again
        if (insertError.message.includes('duplicate key') || insertError.message.includes('unique constraint')) {
          console.log('Got duplicate key error, trying again with null spoonacular_id');
          
          insertData.spoonacular_id = null;
          
          const { error: retryError } = await supabase
            .from('pantry')
            .insert([insertData]);
          
          if (retryError) {
            console.error('Error on retry:', retryError);
            throw new Error(`Failed to add to pantry: ${retryError.message}`);
          }
        } else {
          throw new Error(`Failed to add to pantry: ${insertError.message}`);
        }
      }
      
      setAdded(true);
    } catch (error) {
      console.error('Error adding to pantry:', error);
      setError(error.message || 'Failed to add to pantry');
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