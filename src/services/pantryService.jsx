import { supabase } from '../supabaseClient';

/*/
 * 
 * Fetch all the pantry
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Array of pantry items
 */
const fetchPantryItems = async (userId) => {
  try {
    console.log('Fetching pantry items for user:', userId);
    
    const { data, error } = await supabase
      .from('pantry')
      .select(`
        *,
        ingredients(*)
      `)
      .eq('user_id', userId)
      .order('name');

    if (error) {
      console.error('Error fetching pantry items:', error);
      throw new Error(`Failed to fetch pantry items: ${error.message}`);
    }

    console.log('Fetched pantry items:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('Exception in fetchPantryItems:', error);
    throw error;
  }
};

/**
 * Add an ingredient to the pantry with proper error handling and data normalization
 * 
 * @param {object} params - The parameters
 * @param {string} params.userId - User ID
 * @param {object} params.ingredient - Ingredient data
 * @param {number} params.recipeId - Optional recipe ID
 * @returns {Promise<object>} - Result object with success status
 */
const addToPantry = async ({ userId, ingredient, recipeId = null }) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    if (!ingredient || !ingredient.name) {
      throw new Error('Invalid ingredient data');
    }
    
    // Normalize ingredient name
    const normalizedName = ingredient.name.toLowerCase().trim();
    const amount = parseFloat(ingredient.amount) || 0;
    
    // Preserves the original unit from the ingredient
    const unit = ingredient.unit ? ingredient.unit.toLowerCase().trim() : 'cup';
    
    const price = ingredient.estimatedPrice || ingredient.price || 0;
    
    console.log(`Adding to pantry: ${normalizedName}, ${amount} ${unit}, price: ${price}`);
    
    // Unique ID generation if needed
    const uniqueId = `${normalizedName.replace(/\s+/g, '-')}-${Date.now()}`;
    
    // Get or create ingredient
    let ingredientId;
    
    // Check if ingredient exists by spoonacular_id (if available)
    if (ingredient.id) {
      const { data: existingBySpoonacularId } = await supabase
        .from('ingredients')
        .select('ingredient_id')
        .eq('spoonacular_id', ingredient.id)
        .maybeSingle();
        
      if (existingBySpoonacularId) {
        // Use this ingredient_id instead of creating a new one
        ingredientId = existingBySpoonacularId.ingredient_id;
        console.log(`Found existing ingredient by spoonacular_id: ${ingredientId}`);
      }
    }
    
    // IF not found by spoonacular_id, check by name
    if (!ingredientId) {
      const { data: existingIngredient } = await supabase
        .from('ingredients')
        .select('ingredient_id')
        .ilike('name', normalizedName)
        .maybeSingle();
      
      if (existingIngredient) {
        // Uses existing ingredient
        ingredientId = existingIngredient.ingredient_id;
        
        // Updates price if we have new information
        if (price > 0 || ingredient.pricePerGram > 0) {
          await supabase
            .from('ingredients')
            .update({
              price_per_unit: ingredient.pricePerGram || (price / amount) || 0,
              last_updated: new Date().toISOString()
            })
            .eq('ingredient_id', ingredientId);
        }
      } else {
        // Creates new ingredient
        try {
          const { data: newIngredient, error: insertError } = await supabase
            .from('ingredients')
            .insert([{
              name: normalizedName,
              unit: unit,
              calories_per_unit: ingredient.caloriesPerGram || 0,
              price_per_unit: ingredient.pricePerGram || (price / amount) || 0,
              external_id: uniqueId,
              spoonacular_id: ingredient.id || null,
              last_updated: new Date().toISOString()
            }])
            .select('ingredient_id')
            .single();
          
          if (insertError) {
            console.error('Error inserting ingredient:', insertError);
            
            // If it's a duplicate key error for spoonacular_id, try to find the existing one
            if (insertError.message.includes('duplicate key') && 
                insertError.message.includes('spoonacular_id') && 
                ingredient.id) {
              
              const { data: existingIngredient } = await supabase
                .from('ingredients')
                .select('ingredient_id')
                .eq('spoonacular_id', ingredient.id)
                .single();
                
              if (existingIngredient) {
                ingredientId = existingIngredient.ingredient_id;
                console.log(`Found existing ingredient after duplicate key error: ${ingredientId}`);
              } else {
                throw new Error(`Failed to add ingredient: ${insertError.message}`);
              }
            } else {
              throw new Error(`Failed to add ingredient: ${insertError.message}`);
            }
          } else {
            ingredientId = newIngredient.ingredient_id;
          }
        } catch (insertError) {
          // If the insert fails, try once more to find by spoonacular_id as a fallback
          if (ingredient.id) {
            const { data: existingIngredient } = await supabase
              .from('ingredients')
              .select('ingredient_id')
              .eq('spoonacular_id', ingredient.id)
              .maybeSingle();
              
            if (existingIngredient) {
              ingredientId = existingIngredient.ingredient_id;
              console.log(`Found existing ingredient as fallback: ${ingredientId}`);
            } else {
              throw insertError;
            }
          } else {
            throw insertError;
          }
        }
      }
    }
    
    if (!ingredientId) {
      throw new Error('Failed to get or create ingredient');
    }
    
    // Check if this ingredient is already in user's pantry
    const { data: existingPantryItem, error: pantryCheckError } = await supabase
      .from('pantry')
      .select('pantry_id, quantity, unit, price')
      .eq('user_id', userId)
      .eq('ingredient_id', ingredientId)
      .maybeSingle();
    
    if (pantryCheckError && pantryCheckError.code !== 'PGRST116') {
      console.error('Error checking pantry:', pantryCheckError);
      throw new Error(`Database error: ${pantryCheckError.message}`);
    }
    
    // Update or insert pantry item
    if (existingPantryItem) {
      // Update existing pantry item
      let newQuantity = existingPantryItem.quantity;
      const newPrice = (existingPantryItem.price || 0) + price;
      
      // Only add quantities if units match
      if (existingPantryItem.unit.toLowerCase() === unit.toLowerCase()) {
        newQuantity += amount;
        console.log(`Units match (${unit}), adding quantities: ${existingPantryItem.quantity} + ${amount} = ${newQuantity}`);
      } else {
        // Units don't match - just keep the larger amount
        console.log(`Units don't match: ${existingPantryItem.unit} vs ${unit}, keeping original unit`);
        newQuantity = Math.max(newQuantity, amount);
      }
      
      const updateData = {
        quantity: newQuantity,
        unit: existingPantryItem.unit, 
        price: newPrice,
        added_at: new Date().toISOString(),
        spoonacular_recipe_id: recipeId // Link to the recipe it came from
      };
      
      try {
        const { error: updateError } = await supabase
          .from('pantry')
          .update(updateData)
          .eq('pantry_id', existingPantryItem.pantry_id);
        
        if (updateError) {
          console.error('Error updating pantry:', updateError);
          throw new Error(`Failed to update pantry: ${updateError.message}`);
        }
      } catch (updateError) {
        // If the updated_at column doesn't exist, try without it
        if (updateError.message.includes('updated_at')) {
          delete updateData.updated_at;
          
          const { error: retryError } = await supabase
            .from('pantry')
            .update(updateData)
            .eq('pantry_id', existingPantryItem.pantry_id);
          
          if (retryError) {
            console.error('Error updating pantry on retry:', retryError);
            throw new Error(`Failed to update pantry: ${retryError.message}`);
          }
        } else {
          throw updateError;
        }
      }
      
      return {
        success: true,
        pantryId: existingPantryItem.pantry_id,
        message: 'Updated existing pantry item'
      };
    } else {
      // Insert new pantry item
      const insertData = {
        user_id: userId,
        ingredient_id: ingredientId,
        name: normalizedName,
        quantity: amount,
        unit: unit, // Use the original unit from the ingredient
        price: price,
        added_at: new Date().toISOString(),
        external_id: uniqueId,
        spoonacular_id: ingredient.id || null,
        spoonacular_recipe_id: recipeId
      };
      
      console.log(`Inserting new pantry item with unit: ${unit}`);
      
      try {
        const { data: newItem, error: insertError } = await supabase
          .from('pantry')
          .insert([insertData])
          .select('pantry_id')
          .single();
        
        if (insertError) {
          console.error('Error inserting pantry item:', insertError);
          throw new Error(`Failed to add to pantry: ${insertError.message}`);
        }
        
        return {
          success: true,
          pantryId: newItem.pantry_id,
          message: 'Added new pantry item'
        };
      } catch (error) {
        // Check if it's a duplicate key error
        if (error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
          console.log('Item already exists in pantry, returning success');
          return {
            success: true,
            message: 'Item is already in your pantry',
            alreadyExists: true
          };
        }
        throw error;
      }
    }
  } catch (error) {
    console.error('Exception in addToPantry:', error);
    return {
      success: false,
      error: error.message || 'Failed to add to pantry'
    };
  }
};

/**
 * Remove an item from the pantry
 * 
 * @param {string} pantryId - The pantry item ID
 * @param {string} userId - The user's ID for security validation
 * @returns {Promise<object>} - Result with success status
 */
const removePantryItem = async (pantryId, userId) => {
  try {
    // Verify the item belongs to the user before deleting
    const { data: item, error: fetchError } = await supabase
      .from('pantry')
      .select('user_id')
      .eq('pantry_id', pantryId)
      .single();
    
    if (fetchError) {
      console.error('Error fetching pantry item:', fetchError);
      return { success: false, error: fetchError.message };
    }
    
    // Security check - only delete if the item belongs to the user
    if (item.user_id !== userId) {
      return { success: false, error: 'Permission denied' };
    }
    
    const { error: deleteError } = await supabase
      .from('pantry')
      .delete()
      .eq('pantry_id', pantryId);
    
    if (deleteError) {
      console.error('Error deleting pantry item:', deleteError);
      return { success: false, error: deleteError.message };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error in removePantryItem:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update pantry item quantity
 * 
 * @param {string} pantryId - The pantry item ID
 * @param {number} quantity - New quantity
 * @param {string} userId - The user's ID for security validation
 * @returns {Promise<object>} - Result with success status
 */
const updatePantryItemQuantity = async (pantryId, quantity, userId) => {
  try {
    // Verify the item belongs to the user before updating
    const { data: item, error: fetchError } = await supabase
      .from('pantry')
      .select('user_id, unit')
      .eq('pantry_id', pantryId)
      .single();
    
    if (fetchError) {
      console.error('Error fetching pantry item:', fetchError);
      return { success: false, error: fetchError.message };
    }
    
    // Security check - only update if the item belongs to the user
    if (item.user_id !== userId) {
      return { success: false, error: 'Permission denied' };
    }
    
    // Try updating with just the quantity (omitting updated_at)
    try {
      const { error: updateError } = await supabase
        .from('pantry')
        .update({ quantity })
        .eq('pantry_id', pantryId);
      
      if (updateError) {
        console.error('Error updating pantry quantity:', updateError);
        return { success: false, error: updateError.message };
      }
    } catch (error) {
      console.error('Error in updatePantryItemQuantity:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error in updatePantryItemQuantity:', error);
    return { success: false, error: error.message };
  }
};

// Create the pantryService object with function mappings
const pantryService = {
  getUserPantry: fetchPantryItems,
  addToPantry,
  removeFromPantry: removePantryItem,
  updatePantryItemQuantity
};

// Export as default
export default pantryService;