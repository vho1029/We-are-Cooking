import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Link } from "react-router-dom";

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
      const uniqueRecipeIds = [...new Set(recipeIds)];

      try {
        const response = await fetch(
          `https://api.spoonacular.com/recipes/informationBulk?ids=${uniqueRecipeIds.join(",")}&apiKey=e035ff36a0824d768ead204d0104ec67`
        );
        const recipes = await response.json();
        const recipeMap = {};
        recipes.forEach(recipe => {
          recipeMap[recipe.id] = recipe;
        });

        const enrichedPlans = data.map(plan => ({
          ...plan,
          recipe: recipeMap[plan.spoonacular_id] || null,
        }));

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
              <Link
                to={`/recipe/${plan.spoonacular_id}`}
                className="text-blue-600 hover:underline mt-2 inline-block"
              >
                View Recipe
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MealPlanPage;
