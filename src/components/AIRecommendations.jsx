import React, { useState, useEffect } from 'react';
// Make sure these paths are correct for your project structure
import RecipeCard from './RecipeCard';
import LoadingIndicator from './LoadingIndicator';
import { supabase } from '../supabaseClient'; // Ensure this path is correct

const AIRecommendations = ({ userId }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // This check acts as a safeguard. If userId is missing here,
    // it means the Recommendations wrapper component failed to provide it.
    if (!userId) {
      setLoading(false);
      setError("Cannot fetch recommendations: User ID is missing.");
      setRecommendations([]);
      console.error("AIRecommendations component rendered without a userId prop.");
      return; // Stop execution if no userId
    }

    const fetchRecommendations = async () => {
      setLoading(true);
      setError(null); // Clear previous errors
      setRecommendations([]); // Clear previous recommendations

      try {
        // console.log("AIRecommendations: Fetching recommendations for user:", userId);

        // 1. Get user's dietary preference from the 'users' table
        // Ensure your table is named 'users' and has a 'Dietary' column
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('Dietary')
          .eq('user_id', userId)
          .single();

        // Log profile error but don't stop execution unless critical
        if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = 0 rows found
          console.error("Error fetching user profile data:", profileError);
          // Proceed without dietary preference if profile fetch fails
        }

        // Default to "None" if no preference found or if fetch failed
        const dietaryPreference = profileData?.Dietary || "None";
        // console.log("User dietary preference:", dietaryPreference);

        // 2. Query recipes (example: from 'test_recipes' table)
        // Adjust table name and columns as needed
        let query = supabase
          .from('test_recipes')
          .select('recipe_id, spoonacular_id, title, image, ready_in_minutes, servings, total_price')
          .order('created_at', { ascending: false }); // Example: newest first

        // 3. Apply dietary filter (simple example - adjust as needed for your data)
        // This assumes you want recipes containing the dietary preference in the title.
        // A better approach might use tags or specific boolean columns if available.
        if (dietaryPreference && dietaryPreference !== 'None') {
          query = query.ilike('title', `%${dietaryPreference}%`);
        }

        // 4. Limit results
        query = query.limit(6); // Show up to 6 recommendations

        // 5. Execute the query
        const { data: recipeData, error: recipeError } = await query;

        if (recipeError) {
          console.error("Error fetching recipes:", recipeError);
          throw recipeError; // Throw error to be caught below
        }

        // console.log(`Found ${recipeData?.length || 0} potential recommendations`);

        // 6. Transform data for the RecipeCard component
        // Ensure RecipeCard expects these prop names (id, title, image, etc.)
        const transformedRecipes = recipeData?.map(recipe => ({
          id: recipe.spoonacular_id || recipe.recipe_id, // Use a consistent ID for the key
          title: recipe.title,
          image: recipe.image,
          readyInMinutes: recipe.ready_in_minutes,
          servings: recipe.servings,
          totalPrice: recipe.total_price // Optional: if RecipeCard uses it
        })) || [];

        if (transformedRecipes.length === 0) {
           // Set a user-friendly message if no recipes were found after filtering
           setError("No specific recommendations found for you right now. Explore recipes!");
        }

        setRecommendations(transformedRecipes);

      } catch (err) {
        console.error("Error in fetchRecommendations:", err);
        // Set a generic error message for the user
        setError("Could not load recommendations. Please try again later.");
        setRecommendations([]); // Ensure recommendations are cleared on error
      } finally {
        setLoading(false); // Always stop loading indicator
      }
    };

    fetchRecommendations(); // Execute the fetch function

  }, [userId]); // Dependency array: re-run effect only if userId changes

  // --- Render Logic ---

  // Loading State
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          // Placeholder for loading state
          <div key={i} className="bg-gray-200 rounded-lg shadow-md p-4 h-64 flex items-center justify-center animate-pulse">
            <LoadingIndicator size="small" message={i === 2 ? "Finding recipes..." : ""} />
          </div>
        ))}
      </div>
    );
  }

  // Error State (only show if recommendations are also empty)
  if (error && recommendations.length === 0) {
    return <div className="text-center p-4 text-red-600 bg-red-50 rounded-md">{error}</div>;
  }

  // Success State (display recommendations or "not found" message)
  return (
    <>
      {recommendations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommendations.map(recipe => (
            // Ensure RecipeCard component exists and accepts these props
            <RecipeCard
              key={recipe.id} // Use the unique ID for the key
              recipe={recipe}
              userId={userId} // Pass userId if RecipeCard needs it (e.g., for favorite/meal plan buttons)
            />
          ))}
        </div>
      ) : (
         // If loading is finished, there's no specific error message set,
         // but recommendations array is empty, show the default "not found" message.
         !error ? (
             <div className="text-center p-4 text-gray-600 bg-gray-50 rounded-md">
               No specific recommendations found for you right now. Explore recipes!
             </div>
         ) : null // Avoid showing duplicate messages if 'error' state already contains the message
      )}
    </>
  );
};

export default AIRecommendations;