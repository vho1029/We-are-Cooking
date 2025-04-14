import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { getRecipeDetails } from "../api"; // This still fetches from Spoonacular
import { useGrocery } from "../context/GroceryContext";

export default function MealPlanPage() {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addIngredients } = useGrocery();

  useEffect(() => {
    const fetchMealPlanFromSupabase = async () => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;

      // Step 1: Get meal plan rows
      const { data: planData, error } = await supabase
        .from("user_meal_plans")
        .select("spoonacular_id, meal_type, scheduled_date")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching meal plan:", error.message);
        setLoading(false);
        return;
      }

      const fetchedMeals = [];

      for (const entry of planData) {
        const recipe = await getRecipeDetails(entry.spoonacular_id);
        if (!recipe) continue;

        fetchedMeals.push({
          ...recipe,
          mealType: entry.meal_type,
          scheduledDate: entry.scheduled_date,
        });

        // Optional: add to grocery list
        if (recipe.extendedIngredients) {
          const PRICES = {
            onion: 0.003,
            chicken: 0.01,
            garlic: 0.004,
            butter: 0.009,
            salt: 0.002,
          };

          const ingredients = recipe.extendedIngredients.map((ing) => ({
            name: ing.name.toLowerCase(),
            weight: ing.amount * 100,
            price: (ing.amount * 100) * (PRICES[ing.name.toLowerCase()] || 0),
          }));

          await addIngredients(ingredients);
        }
      }

      setMeals(fetchedMeals);
      setLoading(false);
    };

    fetchMealPlanFromSupabase();
  }, []);

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">🗓 Your Weekly Meal Plan</h2>

      {loading ? (
        <p>Loading meal plan...</p>
      ) : meals.length === 0 ? (
        <p>No meals scheduled yet.</p>
      ) : (
        <ul className="space-y-4">
          {meals.map((meal) => (
            <li key={meal.id} className="border p-4 rounded shadow">
              <h3 className="text-xl font-semibold">{meal.title}</h3>
              <p className="text-sm text-gray-600">
                {meal.mealType} | {meal.scheduledDate}
              </p>
              {meal.image && (
                <img
                  src={meal.image}
                  alt={meal.title}
                  className="w-40 mt-2 rounded"
                />
              )}
              <a
                href={`/recipe/${meal.id}`}
                className="text-blue-600 hover:underline block mt-2"
              >
                View Recipe
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
