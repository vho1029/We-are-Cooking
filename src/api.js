const API_KEY = "47479824a9a442f486fb2cd1059d51c0";//e035ff36a0824d768ead204d0104ec67";
const BASE_URL = "https://api.spoonacular.com";
const PRICE_API_KEY = "PedilSvPc1gJkpZDvz2opYdfQvrPokjI8xLdk0pU";
const PRICE_BASE_URL = "https://api.nal.usda.gov/fdc/v1";
const GEMINI_API_KEY = "AIzaSyDYnaotthPtFO3gArWCHqGbrviybJCYRvw";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

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
      original: item.original, // full text description like "2 cups of flour"
    })) || [];

    return ingredients;
  } catch (error) {
    console.error(`Error fetching ingredients for recipe ${id}:`, error);
    return [];
  }
};

export const getIngredientPrices = async (ingredients) => {
  const ingredientTexts = ingredients.map(ingredient => `${ingredient.amount} ${ingredient.unit} of ${ingredient.name}`).join("\n");

  try {
    // Use Gemini to parse and convert all ingredients to grams in one call
    const parsedIngredients = await parseIngredientsWithGemini(ingredientTexts);
    
    // Check if Gemini returned valid parsed ingredients
    console.log("Parsed Ingredients:", parsedIngredients);

    if (!parsedIngredients || parsedIngredients.length !== ingredients.length) {
      return ingredients.map(ingredient => ({ name: ingredient.name, error: "Error parsing ingredient with Gemini" }));
    }

    // Proceed with fetching price data using the parsed ingredients (in grams)
    const priceData = await Promise.all(parsedIngredients.map(async (parsedIngredient, index) => {
      const { name: parsedName, amount: parsedAmount, unit: parsedUnit } = parsedIngredient;
      const ingredient = ingredients[index];

      const response = await fetch(
        `${PRICE_BASE_URL}/foods/search?query=${encodeURIComponent(parsedName)}&api_key=${PRICE_API_KEY}`
      );
      const data = await response.json();

      // Log the price API response to debug
      console.log(`Price API Response for ${parsedName}:`, data);

      if (data.foods && data.foods.length > 0) {
        const foodItem = data.foods[0];

        const estimatedWeightGram =
          foodItem.foodNutrients?.find((n) => n.unitName === "G")?.value || null;

        const mockPricePerGram = 0.01; // $0.01 per gram, placeholder
        const estimatedPrice = mockPricePerGram * parsedAmount;

        return {
          name: parsedName,
          description: foodItem.description,
          fdcId: foodItem.fdcId,
          estimatedWeightGram,
          category: foodItem.foodCategory,
          amountInGrams: parsedAmount,
          estimatedPrice,
        };
      }

      return { name: parsedName, error: "No data found" };
    }));

    return priceData;
  } catch (error) {
    console.error("Error fetching prices:", error);
    return ingredients.map(ingredient => ({ name: ingredient.name, error: "Fetch error" }));
  }
};

export const parseIngredientsWithGemini = async (ingredientsText) => {
  const prompt = `Parse the following ingredient descriptions into structured JSON. 
Each ingredient should have: name, amount (in grams), and unit: "g". 
Convert all quantities to grams based on the ingredient and unit.
Return an array of JSON objects. Do not include any explanation or text before or after the JSON.

Input:
${ingredientsText}

Example input: "2 cups of chopped onions"
Example output: [{"name": "onion", "amount": 300, "unit": "g"}]

Input:
${ingredientsText}`;

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
