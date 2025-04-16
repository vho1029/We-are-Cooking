const API_KEY = "40f858dc01194ff0be5de594313a0c5f";
const BASE_URL = "https://api.spoonacular.com";
const PRICE_API_KEY = "PedilSvPc1gJkpZDvz2opYdfQvrPokjI8xLdk0pU";
const PRICE_BASE_URL = "https://api.nal.usda.gov/fdc/v1";
const GEMINI_API_KEY = "AIzaSyDYnaotthPtFO3gArWCHqGbrviybJCYRvw";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const KROGER_CLIENT_ID = "mealprepapp-24326124303424556b5a65387447326d6a5763766973473633306e754f6c6e6d48375645546463636643517a6f6c4966517046636c724447375658756751103866440180440";
const KROGER_CLIENT_SECRET = "mPEStwcJ7wJKhKpnsMzIXRhr6sNhWwZugzG7biua";
import { supabase } from "./supabaseClient";

export const fetchRecipes = async (query) => {
  try {
    const response = await fetch(
      `${BASE_URL}/recipes/complexSearch?query=${query}&apiKey=${API_KEY}`
    );
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("Error fetching recipes from Spoonacular:", error);
    return [];
  }
};

export const getRecipeDetails = async (id) => {
  try {
    // Include nutrition data & wine pairing
    const response = await fetch(
      `${BASE_URL}/recipes/${id}/information?apiKey=${API_KEY}&includeNutrition=true&addWinePairing=true`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching details for recipe ${id}:`, error);
    return null;
  }
};

export const saveRecipeToSupabase = async (recipe, totalPrice) => {
  try {
    if (!recipe || !recipe.id) {
      throw new Error('Invalid recipe data');
    }

    const spoonacularId = recipe.id;

    //Check if the recipe already exists
    const { data: existingRecipe, error: fetchError } = await supabase
      .from('test_recipes')
      .select('recipe_id, spoonacular_id') 
      .eq('spoonacular_id', spoonacularId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error checking for existing recipe:', fetchError.message);
      return null;
    }

    if (existingRecipe) {
      // If exists, update only the price
      const { error: updateError } = await supabase
        .from('test_recipes')
        .update({ total_price: totalPrice })
        .eq('spoonacular_id', spoonacularId);

      if (updateError) {
        console.error('Error updating recipe price:', updateError.message);
        return null;
      }

      return existingRecipe.recipe_id;
    } else {
      // If not exists, insert new recipe
      const newRecipe = {
        created_at: new Date().toISOString(),
        spoonacular_id: recipe.id,
        title: recipe.title,
        image: recipe.image,
        summary: recipe.summary,
        ready_in_minutes: recipe.readyInMinutes,
        servings: recipe.servings,
        extended_ingredients: recipe.extendedIngredients,
        analyzed_instructions: recipe.analyzedInstructions,
        nutrition: recipe.nutrition,
        wine_pairing: recipe.winePairing,
        total_price: totalPrice,
      };

      const { data, error } = await supabase
        .from('test_recipes')
        .insert([newRecipe])
        .select();

      if (error) {
        console.error('Error saving new recipe:', error.message);
        return null;
      }

      return data?.[0]?.recipe_id || null;
    }
  } catch (error) {
    console.error('Unexpected error saving recipe:', error);
    return null;
  }
};


export const getRecipeFromSupabase = async (spoonacularId) => {
  const { data, error } = await supabase
    .from('test_recipes')
    .select('*')
    .eq('spoonacular_id', spoonacularId)
    .single();

  if (error) {
    console.error('Error fetching recipe from Supabase:', error.message);
    return null;
  }
  return data;
};

export const insertIngredient = async ({
  ingredientName,
  unit,
  caloriesPerUnit,
  pricePerUnit,
  externalId,
  spoonacularId
}) => {
  try {
    const { data: existingIngredient, error: fetchError } = await supabase
      .from('ingredients')
      .select('ingredient_id')
      .eq('external_id', externalId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error checking ingredient:', fetchError.message);
      return null;
    }

    if (existingIngredient) {
      const { error: updateError } = await supabase
        .from('ingredients')
        .update({
          price_per_unit: pricePerUnit,
          calories_per_unit: caloriesPerUnit,
          last_updated: new Date().toISOString(),
        })
        .eq('ingredient_id', existingIngredient.ingredient_id);
      if (updateError) {
        console.error('Error updating existing ingredient:', updateError.message);
        return null;
      }
      console.log(`Updated ingredient ${ingredientName} with ingredient ID: `, existingIngredient.ingredient_id);
      return existingIngredient.ingredient_id;
    }

    const { data: inserted, error: insertError } = await supabase
      .from('ingredients')
      .insert([{
        name: ingredientName,
        unit,
        calories_per_unit: caloriesPerUnit,
        price_per_unit: pricePerUnit,
        last_updated: new Date().toISOString(),
        external_id: externalId,
        spoonacular_id: spoonacularId,
      }])
      .select('ingredient_id')
      .single();

    if (insertError) {
      console.error('Error inserting new ingredient:', insertError.message);
      return null;
    }
    console.log(`Inserted ingredient ${ingredientName} with ingredient ID: `, inserted.ingredient_id);
    return inserted.ingredient_id;
  } catch (err) {
    console.error('Unexpected error in upsertIngredient:', err);
    return null;
  }
};

export const insertPantryItem = async ({
  userId,
  ingredientId,
  ingredientName,
  quantity,
  unit,
  price,
  externalId,
  spoonacularId,
  spoonacularRecipeId,
}) => {
  try {
    const { data: existingEntry, error: fetchError } = await supabase
      .from('pantry')
      .select('pantry_id, quantity, price')
      .eq('user_id', userId)
      .eq('ingredient_id', ingredientId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error checking pantry:', fetchError.message);
      return;
    }

    if (existingEntry) {
      // Update existing entry
      const updatedQuantity = existingEntry.quantity + quantity;
      const updatedPrice = (existingEntry.price || 0) + price;

      const { error: updateError } = await supabase
        .from('pantry')
        .update({
          quantity: updatedQuantity,
          price: updatedPrice,
          added_at: new Date().toISOString(),
        })
        .eq('pantry_id', existingEntry.pantry_id);

      if (updateError) {
        console.error('Error updating pantry item:', updateError.message);
      }
    } else {
      // Insert new pantry entry
      const { error: insertError } = await supabase.from('pantry').insert([{
        user_id: userId,
        ingredient_id: ingredientId,
        name: ingredientName,
        quantity,
        unit,
        price,
        added_at: new Date().toISOString(),
        external_id: externalId,
        spoonacular_id: spoonacularId,
        spoonacular_recipe_id: spoonacularRecipeId,
      }]);

      if (insertError) {
        console.error('Error inserting new pantry item:', insertError.message);
      }
    }
  } catch (err) {
    console.error('Unexpected error in upsertPantryItem:', err);
  }
};

export const getMealPlan = async () => {
  try {
    const response = await fetch(
      `${BASE_URL}/mealplanner/generate?timeFrame=week&apiKey=${API_KEY}`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching meal plan:", error);
    return null;
  }
};

export const addMealPlan = async ({ userId, recipeId, mealType, scheduledDate , recipeDbId}) => {
  try {
    const { error } = await supabase
      .from('user_meal_plans')
      .insert([
        {
          user_id: userId,
          recipe_id: recipeDbId,
          spoonacular_id: recipeId,
          meal_type: mealType,
          scheduled_date: scheduledDate,
        },
      ]);
      console.log("Recipe added to meal plan");
    if (error) {
      throw new Error(error.message);
    }
  } catch (err) {
    console.error('Error adding to meal plan:', err.message);
    alert('Failed to add to meal plan.');
  }
};

export const fetchFilteredRecipes = async ({ query, diet, cuisine, mealType }) => {
  try {
    const params = new URLSearchParams({
      apiKey: API_KEY,
      number: 10,
    });

    if (query) params.append("query", query);
    if (diet) params.append("diet", diet);
    if (cuisine) params.append("cuisine", cuisine);
    if (mealType) params.append("type", mealType);

    const response = await fetch(
      `${BASE_URL}/recipes/complexSearch?${params.toString()}`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching filtered recipes:", error);
    return null;
  }
};

export const getRecipeIngredients = async (id) => {
  try {
    const response = await fetch(
      `${BASE_URL}/recipes/${id}/information?apiKey=${API_KEY}`
    );
    const data = await response.json();

    // Extract ingredients
    const ingredients = data.extendedIngredients?.map((item) => ({
      id: item.id,
      name: item.name,
      amount: item.amount,
      unit: item.unit,
      original: item.original, 
    })) || [];

    return ingredients;
  } catch (error) {
    console.error(`Error fetching ingredients for recipe ${id}:`, error);
    return [];
  }
};

export const getKrogerAuthAndLocationId = async () => {
  const zipCode = '30033';

  // Get Access Token
  const authString = `${KROGER_CLIENT_ID}:${KROGER_CLIENT_SECRET}`;
  const encodedAuth = btoa(authString);

  try {
    const tokenResponse = await fetch("/api/v1/connect/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${encodedAuth}`,
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        scope: "product.compact",
      }),
    });

    const tokenData = await tokenResponse.json();
    const token = tokenData.access_token;

    if (!token) throw new Error("Failed to retrieve access token");

    // Use token to fetch location ID
    const locationResponse = await fetch(`/api/v1/locations?filter.zipCode.near=${zipCode}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const locationData = await locationResponse.json();

    if (locationData.data && locationData.data.length > 0) {
      const location = locationData.data[0];
      const locationId = location.locationId;

      console.log(`Location ID for ${location.name}: ${locationId}`);
      return { token, locationId };
    } else {
      console.error("No locations found for the given zip code.");
      return { token, locationId: null };
    }

  } catch (error) {
    console.error("Error in auth/location fetch:", error);
    return { token: null, locationId: null };
  }
};

/*
export const getIngredientPrices = async (ingredients) => {
  //const ingredientTexts = ingredients.map(ingredient => `${ingredient.amount} ${ingredient.unit} of ${ingredient.name}`).join("\n");

  try {
    // Use Gemini to parse and convert all ingredients to grams in one call
    const parsedIngredients = await parseIngredientsWithGemini(
      ingredients.map(i => ({
        name: i.name,
        amount: i.amount,
        unit: i.unit || i.measures?.metric?.unitLong || ""
      }))
    );
    
    // Check if Gemini returned valid parsed ingredients
    console.log("Parsed Ingredients:", parsedIngredients);
    if (!parsedIngredients || parsedIngredients.length !== ingredients.length) {
      return ingredients.map(ingredient => ({ 
        name: ingredient.name, 
        error: "Error parsing ingredient with Gemini" 
      }));
    }
    const { token, locationId } = await getKrogerAuthAndLocationId();
    if (!token || !locationId) {
      throw new Error("Failed to fetch Kroger token or location ID.");
    }
    // Proceed with fetching price data using the parsed ingredients
    const priceData = await Promise.all(
      parsedIngredients.map(async (parsedIngredient, index) => {
      const ingredientName = ingredients[index].name;
      const amountInGrams = parsedIngredient.amount;
      const response = await fetch(
        `/api/v1/products?filter.term=${encodeURIComponent(ingredientName)}&filter.locationId=${locationId}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      const krogerItem = data.data?.[0];
      if (!krogerItem || !krogerItem.items?.length) {
        return { name: ingredientName, error: "No Kroger match found" };
      }
      console.log("First Kroger item for", ingredientName, data.data[0]);
      // Log the price API response to debug
      
      const item = krogerItem.items[0];
      const name = item.description;
      const price = item.price?.regular;
      const size = item.size;

      if (!price || !size) {
        return { name: ingredientName, error: "Missing price/size info" };
      }

      if (krogerItem && krogerItem.items?.length > 0) {

        if (!price || !size) {
          return { name: name, error: "Missing price or size info" };
        }
        console.log(`${ingredientName} found price at Kroger for ${price}`);
        console.log(`${ingredientName} the number sent to gemini is ${ingredients[index].amount} and in unit ${ingredients[index].unit}`);
        console.log(`${ingredientName} parsed amount in grams:`, amountInGrams);
        console.log(`${ingredientName} the size found at kroger is ${size}`);
        // Pass the relevant Kroger details to gemini
        const parsedKrogerItems = await parseKrogerIngredientsWithGemini(
          krogerItems.map(k => ({
            name: k.description,
            price: k.items?.[0]?.price?.regular,
            size: k.items?.[0]?.size,
          }))
        );
        console.log(`${ingredientName} Returned Price per Gram ${pricePerGram}`);
        console.log(`${ingredientName} Returned Calories per Gram ${caloriesPerGram}`);
        const estimatedPrice = pricePerGram * amountInGrams;
        console.log(`${ingredientName} Estimated price is: ${estimatedPrice}`);
        return {
          name: ingredientName,
          krogerId: krogerItem.productId,
          amountInGrams: amountInGrams,
          estimatedPrice: estimatedPrice, // Calculated based on weight and price
          caloriesPerGram: caloriesPerGram,
          pricePerGram: pricePerGram,
        };
      }
      return { name: ingredientName, error: "No data found" };
    }));

    return priceData;
  } catch (error) {
    console.error("Error fetching prices:", error);
    return ingredients.map(ingredient => ({ name: ingredient.name, error: "Fetch error" }));
  }
};
*/

export const getIngredientPrices = async (ingredients) => {
  try {
    // Parse all ingredient weights
    const parsedIngredients = await parseIngredientsWithGemini(
      ingredients.map(i => ({
        name: i.name,
        amount: i.amount,
        unit: i.unit || i.measures?.metric?.unitLong || ""
      }))
    );

    if (!parsedIngredients || parsedIngredients.length !== ingredients.length) {
      return ingredients.map(ingredient => ({
        name: ingredient.name,
        error: "Error parsing ingredient with Gemini"
      }));
    }

    // Get Kroger token and location
    const { token, locationId } = await getKrogerAuthAndLocationId();
    if (!token || !locationId) {
      throw new Error("Failed to fetch Kroger token or location ID.");
    }

    // Fetch Kroger data for all ingredients
    const krogerRawData = await Promise.all(
      parsedIngredients.map(async (parsedIngredient, index) => {
        const ingredientName = ingredients[index].name;
        const response = await fetch(
          `/api/v1/products?filter.term=${encodeURIComponent(ingredientName)}&filter.locationId=${locationId}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        const krogerItem = data.data?.[0];
        const item = krogerItem?.items?.[0];

        return {
          ingredientIndex: index,
          ingredientName,
          amountInGrams: parsedIngredient.amount,
          krogerId: krogerItem?.productId,
          name: krogerItem?.description,
          price: item?.price?.regular,
          size: item?.size,
          error: (!krogerItem || !item?.price?.regular || !item?.size) ? "Missing price or size info" : null
        };
      })
    );

    // Filter valid items for batch Gemini input
    const validItemsForGemini = krogerRawData.filter(item => !item.error);
    const parsedKrogerResults = await parseKrogerIngredientsWithGemini(
      validItemsForGemini.map(item => ({
        name: item.name,
        price: item.price,
        size: item.size,
      }))
    );
    let parsedIndex = 0;
    // Map results back to full result list
    const finalResults = krogerRawData.map((item, index) => {
      if (item.error) {
        return { name: item.ingredientName, error: item.error };
      }

      const { weightInGrams, caloriesPerGram } = parsedKrogerResults[parsedIndex++];
      const pricePerGram = item.price / weightInGrams;
      const estimatedPrice = pricePerGram * item.amountInGrams;
      return {
        name: item.ingredientName,
        krogerId: item.krogerId,
        amountInGrams: item.amountInGrams,
        estimatedPrice,
        caloriesPerGram,
        pricePerGram,
      };
    });

    return finalResults;
  } catch (error) {
    console.error("Error fetching prices:", error);
    return ingredients.map(ingredient => ({ name: ingredient.name, error: "Fetch error" }));
  }
};

export const parseIngredientsWithGemini = async (ingredients) => {
  const formattedIngredients = JSON.stringify(ingredients, null, 2);

  const prompt = `Parse the following ingredient descriptions into structured JSON.
  Each ingredient should have: 
  - "name" (as-is, do not simplify),
  - "amount" (in grams only).
  
  Convert all quantities to grams based on the ingredient and unit. 
  If no unit or ambiguous quantity is provided, infer a realistic cooking amount for a single recipe and assume it is a serving size amount
  Return ONLY a valid JSON array, no explanations, no comments, no markdown.
  
  Input:
  ${formattedIngredients}
  
  Example input: [{"name": "olive oil", "amount": "1", "unit": "tbsp"}]
  Example output: [{"name": "olive oil", "amount": 13}]`;
  

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  // Log the response from Gemini to verify parsing
  console.log("Gemini Response:", data);

  try {
    return JSON.parse(text);
  } catch (e) {
    // Try to extract JSON substring if full response isn't parsable
    const match = text.match(/\[.*\]|\{.*\}/s); // supports array or single object
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (inner) {
        console.error("Still couldn't parse extracted JSON:", match[0]);
      }
    }
    console.error("Gemini returned unparseable result:", text);
    return null;
  }
};

/*
export const parseKrogerIngredientsWithGemini = async ({ name, price, size }) => {
  const prompt = `
Given the following size/quantity information, estimate the total weight in grams (e.g., "2 lb" → 907 grams, "12 oz" → 340 grams):\n\n${size}

Based on common nutritional knowledge, estimate the calories per gram for the following food item:\n\n${name}

Return only the weight in grams and estimated calories per gram in the following format:

Weight in Grams: [weight in grams]
Calories per Gram: [calories per gram]
`;

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

  const [weightLine, caloriesLine] = text.split("\n").map(line => line.trim());
  const weightInGrams = parseFloat(weightLine.replace('Weight in Grams: ', '').trim()) || 0;
  const caloriesPerGram = parseFloat(caloriesLine.replace('Calories per Gram: ', '').trim()) || 0;

  const pricePerGram = weightInGrams > 0 ? price / weightInGrams : 0;

  /*
  console.log(`Weight in grams: ${weightInGrams}`);
  console.log(`Calories per gram: ${caloriesPerGram}`);
  console.log(`Price per gram: ${pricePerGram}`);
  *//*
  return {
    pricePerGram,
    caloriesPerGram,
  };
};*/

export const parseKrogerIngredientsWithGemini = async (items) => {
  const prompt = `
Given the following list of grocery items with size, estimate:

1. Total weight in grams for each item (e.g., "2 lb" → 907 grams, "12 oz" → 340 grams). If no appropriate unit is given, assume a serving amount.
2. Estimated calories per gram based on common nutritional knowledge.

Return only this info for each item, using the exact format:

Item: [name]
Weight in Grams: [weight in grams]
Calories per Gram: [calories per gram]

Items:
${items.map((item, index) =>
  `Item ${index + 1}:
Name: ${item.name}
Size: ${item.size}`
).join("\n\n")}
`;

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

  const results = text
    .split("Item:")
    .slice(1)
    .map(block => {
      const lines = block.trim().split("\n");
      const weightLine = lines.find(line => line.startsWith("Weight in Grams:"));
      const caloriesLine = lines.find(line => line.startsWith("Calories per Gram:"));
      
      return {
        weightInGrams: parseFloat(weightLine?.replace("Weight in Grams:", "").trim()) || 0,
        caloriesPerGram: parseFloat(caloriesLine?.replace("Calories per Gram:", "").trim()) || 0,
      };
    });

  return results;
};

