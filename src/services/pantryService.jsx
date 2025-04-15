import { supabase } from '../supabaseClient';
import { insertIngredient, insertPantryItem } from '../api';

export const pantryService = {
  // Get all pantry items for a user
  getUserPantry: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('pantry')
        .select('*')
        .eq('user_id', userId);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching pantry items:', error);
      return [];
    }
  },
  
  // Add an ingredient to pantry
  addToPantry: async (userId, ingredient) => {
    try {
      if (!userId || !ingredient) {
        throw new Error('Missing userId or ingredient data');
      }
      
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
        spoonacularRecipeId: ingredient.recipeId || null,
      });
      
      return true;
    } catch (error) {
      console.error('Error adding ingredient to pantry:', error);
      throw error;
    }
  },
  
  // Remove an item from pantry
  removeFromPantry: async (pantryId) => {
    try {
      const { error } = await supabase
        .from('pantry')
        .delete()
        .eq('pantry_id', pantryId);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error removing from pantry:', error);
      throw error;
    }
  },
  
  // Update pantry item quantity
  updatePantryItemQuantity: async (pantryId, newQuantity) => {
    try {
      const { error } = await supabase
        .from('pantry')
        .update({ quantity: newQuantity })
        .eq('pantry_id', pantryId);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating pantry item:', error);
      throw error;
    }
  }
};