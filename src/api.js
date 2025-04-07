const API_KEY = "e035ff36a0824d768ead204d0104ec67";
const BASE_URL = "https://api.spoonacular.com";
const PRICE_API_KEY = "PedilSvPc1gJkpZDvz2opYdfQvrPokjI8xLdk0pU";
const PRICE_BASE_URL = "https://api.nal.usda.gov/fdc/v1";

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
  const fetchPriceForIngredient = async (ingredient) => {
    const { name, amount, unit } = ingredient;

    try {
      const response = await fetch(
        `${PRICE_BASE_URL}/foods/search?query=${encodeURIComponent(name)}&api_key=${PRICE_API_KEY}`
      );
      const data = await response.json();

      if (data.foods && data.foods.length > 0) {
        const foodItem = data.foods[0];

        const estimatedWeightGram =
          foodItem.foodNutrients?.find((n) => n.unitName === "G")?.value || null;

        const mockPricePerGram = 0.01; // $0.01 per gram, placeholder
        const amountInGrams = convertToGrams(amount, unit, name);
        const estimatedPrice = mockPricePerGram * amountInGrams;

        return {
          name,
          description: foodItem.description,
          fdcId: foodItem.fdcId,
          estimatedWeightGram,
          category: foodItem.foodCategory,
          amountInGrams,
          estimatedPrice,
        };
      }

      return { name, error: "No data found" };
    } catch (error) {
      console.error(`Error fetching price data for ${name}:`, error);
      return { name, error: "Fetch error" };
    }
  };

  const priceData = await Promise.all(ingredients.map((ingredient) => fetchPriceForIngredient(ingredient)));
  return priceData;
};

const convertToGrams = (amount, unit, name) => {
  const normalizedName = name
    .toLowerCase()
    .replace(/[\s_]+/g, "_") // Replace spaces or underscores with underscores
    .replace(/boneless|skinless|,|.|pieces?/g, "") // Remove "boneless", "skinless", and "piece" from the name
    .trim();

  if (normalizedName.endsWith("s") && !normalizedName.match(/(peas|chiles|mussels|clams)$/)) {
    // Only remove the 's' if it isn't a word like "peas", "chiles", etc.
    normalizedName = normalizedName.slice(0, -1);
  }
  if (wholeItemsWeightMap[normalizedName]) {
    return amount * wholeItemsWeightMap[normalizedName];
  }

  let conversion = volumeToGramsMap[normalizedName];

  if (!conversion) {
    for (const ingredient in volumeToGramsMap) {
      if (normalizedName.includes(ingredient)) {
        conversion = volumeToGramsMap[ingredient];
        break;
      }
    }
  }

  if (conversion && conversion[unit.toLowerCase()]) {
    return amount * conversion[unit.toLowerCase()];
  }

  switch (unit.toLowerCase()) {
    case "cup":
      return amount * 240;
    case "tablespoon":
    case "tbsp":
      return amount * 15;
    case "teaspoon":
    case "tsp":
      return amount * 5;
    case "g":
    case "gram":
      return amount;
    case "kg":
      return amount * 1000;
    case "oz":
      return amount * 28.35;
    case "lbs":
    case "lb":
      return amount * 453.6;
    case "mg":
      return amount / 1000;
    default:
      return amount;
  }
};

const volumeToGramsMap = {
  sugar: {
    cup: 200,
    tablespoon: 12.5,
    teaspoon: 4.2,
  },
  flour: {
    cup: 120,
    tablespoon: 7.5,
    teaspoon: 2.5,
  },
  butter: {
    cup: 227,
    tablespoon: 14,
    teaspoon: 4.7,
  },
  milk: {
    cup: 240,
    tablespoon: 15,
    teaspoon: 5,
  },
  salt: {
    cup: 273,
    tablespoon: 18,
    teaspoon: 6,
  },
  rice: {
    cup: 185, // for white rice
    tablespoon: 12.3,
    teaspoon: 4.1,
  },
  ginger: {
    cup: 120, // finely grated ginger
    tablespoon: 6.4,
    teaspoon: 2.1,
  },
  soy_sauce: {
    cup: 240,
    tablespoon: 16,
    teaspoon: 5.3,
  },
  honey: {
    cup: 340,
    tablespoon: 21.3,
    teaspoon: 7.1,
  },
  cocoa_powder: {
    cup: 85,
    tablespoon: 5.3,
    teaspoon: 1.8,
  },
  peanut_butter: {
    cup: 250,
    tablespoon: 15.6,
    teaspoon: 5.2,
  },
  vanilla_extract: {
    cup: 240,
    tablespoon: 16,
    teaspoon: 5.3,
  },
  olive_oil: {
    cup: 216,
    tablespoon: 13.5,
    teaspoon: 4.5,
  },
  coconut_oil: {
    cup: 218,
    tablespoon: 13.6,
    teaspoon: 4.5,
  },
  breadcrumbs: {
    cup: 120,
    tablespoon: 7.5,
    teaspoon: 2.5,
  },
  cornstarch: {
    cup: 128,
    tablespoon: 8,
    teaspoon: 2.6,
  },
  baking_powder: {
    cup: 120,
    tablespoon: 15,
    teaspoon: 4.9,
  },
  baking_soda: {
    cup: 220,
    tablespoon: 13.8,
    teaspoon: 4.6,
  },
  yogurt: {
    cup: 245,
    tablespoon: 15.3,
    teaspoon: 5.1,
  },
  cheese_grated: {
    cup: 100, // for cheese like parmesan or mozzarella
    tablespoon: 6.25,
    teaspoon: 2.1,
  },
  ground_beef: {
    cup: 200,
    tablespoon: 12.5,
    teaspoon: 4.2,
  },
  chicken_breast: {
    cup: 140, // cooked, shredded chicken breast
    tablespoon: 8.75,
    teaspoon: 2.9,
  },
  tomato_paste: {
    cup: 240,
    tablespoon: 15,
    teaspoon: 5,
  },
  mayonnaise: {
    cup: 220,
    tablespoon: 13.8,
    teaspoon: 4.6,
  },
  ketchup: {
    cup: 240,
    tablespoon: 16,
    teaspoon: 5.3,
  },
  mustard: {
    cup: 240,
    tablespoon: 16,
    teaspoon: 5.3,
  },
  sour_cream: {
    cup: 240,
    tablespoon: 15,
    teaspoon: 5,
  },
  cream_cheese: {
    cup: 230,
    tablespoon: 14.4,
    teaspoon: 4.8,
  },
  maple_syrup: {
    cup: 330,
    tablespoon: 20.6,
    teaspoon: 6.9,
  },
  coconut_flour: {
    cup: 112,
    tablespoon: 7,
    teaspoon: 2.3,
  },
  almond_flour: {
    cup: 96,
    tablespoon: 6,
    teaspoon: 2,
  },
  chia_seeds: {
    cup: 160,
    tablespoon: 10,
    teaspoon: 3.3,
  },
  flaxseeds: {
    cup: 160,
    tablespoon: 10,
    teaspoon: 3.3,
  },
  oats: {
    cup: 90,
    tablespoon: 5.6,
    teaspoon: 1.9,
  },
  quinoa: {
    cup: 170,
    tablespoon: 10.6,
    teaspoon: 3.5,
  },
  sunflower_seeds: {
    cup: 140,
    tablespoon: 8.8,
    teaspoon: 2.9,
  },
};

const wholeItemsWeightMap = {
  onion: 150,   // 1 onion weighs approximately 150g
  garlic_clove: 3,  // 1 garlic clove weighs about 3g
  potato: 170,  // 1 medium potato weighs about 170g
  tomato: 100,  // 1 medium tomato weighs about 100g
  apple: 182,   // 1 medium apple weighs about 182g
  apples: 182,
  banana: 118,  // 1 medium banana weighs about 118g

  // Meat items (average weight for common cuts)
  chicken_thigh: 130,  // 1 chicken thigh weighs approximately 130g
  chicken_thighs: 130,
  chicken_breast: 174,  // 1 boneless chicken breast weighs about 174g
  chicken_breasts: 174,
  chicken_leg: 150,  // 1 chicken leg weighs approximately 150g
  chicken_legs: 150,
  chicken_wing: 90,  // 1 chicken wing weighs approximately 90g
  chicken_wings: 90,
  steak: 200,   // 1 steak (average cut) weighs about 200g
  steaks: 200,
  pork_chop: 170, // 1 pork chop weighs about 170g
  pork_chops: 170,
  fish: 180,    // 1 piece of fish (average fillet) weighs about 180g
};

