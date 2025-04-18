import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Link } from "react-router-dom";
import RemoveRecipeButton from "../components/RemovePlanButton";
import FavoriteButton from "../components/FavoriteButton";

const MealPlanPage = ({ userData }) => {
  const [mealPlans, setMealPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userData?.id) return;

    async function fetchMealPlans() {
      setLoading(true);

      const { data, error } = await supabase
        .from("user_meal_plans")
        .select("spoonacular_id, meal_type, scheduled_date")
        .eq("user_id", userData.id)
        .order("scheduled_date", { ascending: true });

      if (error) {
        console.error("Error fetching meal plans:", error);
        setLoading(false);
        return;
      }

      if (data.length === 0) {
        setMealPlans([]);
        setLoading(false);
        return;
      }

      const recipeIds = data.map(item => item.spoonacular_id);

      try {
        const { data: recipeData, error: recipeError } = await supabase
          .from('test_recipes')
          .select('spoonacular_id, title, image, extended_ingredients, analyzed_instructions, nutrition')
          .in('spoonacular_id', recipeIds);

        if (recipeError) {
          console.error('Error fetching recipes from test_recipes:', recipeError);
          setLoading(false);
          return;
        }

        const recipeMap = {};
        recipeData.forEach(recipe => {
          recipeMap[recipe.spoonacular_id] = recipe;
        });

        const enrichedPlans = await Promise.all(
          data.map(async (plan) => {
            const recipe = recipeMap[plan.spoonacular_id];

            if (
              !recipe ||
              !recipe.extended_ingredients ||
              !recipe.analyzed_instructions ||
              !recipe.nutrition
            ) {
              try {
                const response = await fetch(
                  `https://api.spoonacular.com/recipes/informationBulk?ids=${plan.spoonacular_id}&apiKey=0e2a083a8ead436e883e2e9f3f135f83`
                );
                const apiData = await response.json();
                const apiRecipe = apiData[0]; 

                return {
                  ...plan,
                  recipe: apiRecipe || null,
                };
              } catch (apiError) {
                console.error('Error fetching recipe data from Spoonacular:', apiError);
                return {
                  ...plan,
                  recipe: null,
                };
              }
            } else {
              return {
                ...plan,
                recipe: recipe || null,
              };
            }
          })
        );

        setMealPlans(enrichedPlans);
      } catch (apiError) {
        console.error("Error fetching recipe data:", apiError);
      }

      setLoading(false);
    }

    fetchMealPlans();
  }, [userData?.id]);

  if (!userData?.id) {
    return <p className="text-center text-gray-500">Please log in to view your meal plan.</p>;
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Your Meal Plan</h2>
      {loading ? (
        <p>Loading meal plan...</p>
      ) : mealPlans.length === 0 ? (
        <p className="text-gray-500">No meals planned yet.</p>
      ) : (
        <div className="space-y-4">
          {mealPlans.map((plan, index) => (
            <div key={`${plan.recipe_id}-${plan.scheduled_date}-${index}`} className="border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg text-gray-800">
                  {plan.recipe?.title || "Unknown Recipe"}
                </h3>
                <span className="text-sm text-gray-600">
                  {new Date(plan.scheduled_date).toLocaleDateString()} - {plan.meal_type}
                </span>
              </div>
              {plan.recipe?.image && (
                <img
                  src={plan.recipe.image}
                  alt={plan.recipe.title}
                  className="w-32 h-32 object-cover mt-2 rounded-md"
                />
              )}
              <div className="flex justify-between items-center mt-2">
                {/* Remove Recipe Button */}
                <RemoveRecipeButton spoonacularId={plan.spoonacular_id} userId={userData?.id} />
                <FavoriteButton recipeId = {plan.recipe?.spoonacular_id || plan.recipe?.id} userId= {userData?.id}/>
                {/* View Recipe Button */}
                <Link
                  to={`/recipe/${plan.spoonacular_id || plan.id}`}
                  className="text-blue-600 hover:underline"
                >
                  View Recipe
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MealPlanPage;
