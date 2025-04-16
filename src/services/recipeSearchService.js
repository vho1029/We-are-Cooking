import { supabase } from "../supabaseClient";
import { fetchRecipesFromSpoonacular } from "./spoonacularService";

/**
 * Search for recipes with merged cached + fresh results.
 * Automatically caches new Spoonacular results into Supabase.
 */
export const searchRecipes = async ({
  query,
  diet = "",
  cuisine = "",
  type = "",
  maxResults = 10,
  userId = null
}) => {
  try {
    // Step 1: Get cached recipes from Supabase
    const { data: cached, error: cacheError } = await supabase
      .from("test_recipes")
      .select("*")
      .ilike("title", `%${query}%`);

    if (cacheError) {
      console.warn("❌ Supabase cache lookup error:", cacheError.message);
    }

    const cachedIds = cached?.map((r) => String(r.spoonacular_id)) || [];

    // Step 2: Fetch from Spoonacular
    const spoonacularResults = await fetchRecipesFromSpoonacular({
      query,
      diet,
      cuisine,
      type,
      maxResults
    });

    // Step 3: Filter out already cached
    const freshResults = spoonacularResults.filter(
      (r) => !cachedIds.includes(String(r.id))
    );

    // Step 4: Cache the fresh ones
    for (const recipe of freshResults) {
      const insertData = {
        spoonacular_id: String(recipe.id),
        title: recipe.title,
        summary: recipe.summary || "",
        image: recipe.image  // CHANGED FROM image_url TO image
          ? recipe.image
          : `https://spoonacular.com/recipeImages/${recipe.id}-480x360.jpg`,
        total_price: recipe.pricePerServing
          ? ((recipe.pricePerServing * recipe.servings) / 100).toFixed(2)
          : 0,
        servings: recipe.servings || 1,
        ready_in_minutes: recipe.readyInMinutes || 0,
        created_by: userId || null,
      };

      console.log(`📝 Caching: ${recipe.title}`);
      const { error: insertError } = await supabase
        .from("test_recipes")
        .upsert(insertData, { onConflict: "spoonacular_id" });

      if (insertError) {
        console.error(`❌ Failed to cache: ${recipe.title}`, insertError.message);
      } else {
        console.log(`✅ Cached: ${recipe.title}`);
      }
    }

    // Step 5: Merge cached and fresh
    const merged = [
      ...(cached || []).map((r) => ({
        id: r.spoonacular_id,
        title: r.title,
        image: r.image,  // CHANGED FROM r.image_url TO r.image
        summary: r.summary || "",
        readyInMinutes: r.ready_in_minutes,
        servings: r.servings,
        totalPrice: r.total_price,
        isFromLocalDb: true
      })),
      ...freshResults.map((r) => ({
        id: r.id,
        title: r.title,
        image: r.image
          ? r.image
          : `https://spoonacular.com/recipeImages/${r.id}-480x360.jpg`,
        summary: r.summary || "",
        readyInMinutes: r.readyInMinutes,
        servings: r.servings,
        totalPrice: r.pricePerServing
          ? ((r.pricePerServing * r.servings) / 100).toFixed(2)
          : 0,
        isFromLocalDb: false
      }))
    ];

    return merged;
  } catch (err) {
    console.error("❌ searchRecipes fatal error:", err.message);
    return [];
  }
};