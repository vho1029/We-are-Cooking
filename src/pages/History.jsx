import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import FavoriteButton from "../components/FavoriteButton";
import MealPlanButton from "../components/MealPlanButton";

const HistoryPage = ({ userData }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!userData?.id) {
                setLoading(false);
                setError("User not logged in");
                return;
            }
            setLoading(true);
            setError(null);
            try {
                const { data: mealHistoryData, error: mealHistoryError } = await supabase
                    .from('meal_history')
                    .select('recipe_id, meal_type, scheduled_date, spoonacular_id')
                    .eq('user_id', userData.id);

                if (mealHistoryError) {
                    setError('Error fetching meal history');
                    console.error('Error fetching meal history:', mealHistoryError.message);
                    return;
                }

                const recipeIds = mealHistoryData.map(meal => meal.recipe_id);
                const { data: recipeData, error: recipeError } = await supabase
                    .from('test_recipes')
                    .select('recipe_id, spoonacular_id, title, image')
                    .in('recipe_id', recipeIds);

                if (recipeError) {
                    setError('Error fetching recipe details');
                    console.error('Error fetching recipe details:', recipeError.message);
                    return;
                }
                const combinedData = mealHistoryData.map(meal => {
                    const recipe = recipeData.find(r => r.recipe_id === meal.recipe_id);
                    return {
                    ...meal,
                    id: recipe?.spoonacular_id,
                    title: recipe?.title,
                    image: recipe?.image,
                    };
                });
        
                setHistory(combinedData);
        
                } catch (err) {
                    setError('Unexpected error fetching meal history');
                    console.error('Unexpected error:', err);
                } finally {
                    setLoading(false);
                }
            };
        fetchHistory();
    }, [userData?.id]);
  
    if (loading) return <div>Loading history...</div>;
    if (error) return <div>{error}</div>;
  
    return (
        <div className="p-4 w-full">
          <h2 className="text-2xl font-bold mb-4">Meal History</h2>
          {loading ? (
            <p>Loading...</p>
          ) : history.length === 0 ? (
            <p className="text-gray-500">No meal history found.</p>
          ) : (
            <ul className="space-y-4">
              {history.map((meal, index) => (
                <div
                  key={`${meal.recipe_id}-${index}`}
                  className="border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <h3 className="font-bold text-lg text-gray-800">{meal.title}</h3>
                  {meal.image && (
                    <img
                      src={meal.image}
                      alt={meal.title}
                      className="w-32 h-32 object-cover mt-2 rounded-md"
                    />
                  )}
                  <div className="mt-3 text-sm text-gray-700 space-y-1">
                    <p>
                      <span className="font-semibold">Meal Type:</span> {meal.meal_type}
                    </p>
                    <p>
                      <span className="font-semibold">Scheduled Date:</span>{" "}
                      {new Date(meal.scheduled_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex justify-between items-center mt-3 gap-4 flex-wrap">
                    <div className="flex items-center gap-x-4">
                        <FavoriteButton recipeId={meal.id} userId={userData?.id} />
                        <MealPlanButton recipeId={meal.id} userId={userData?.id} />
                    </div>
                    <Link
                        to={`/recipe/${meal.id}`}
                        className="text-blue-600 hover:underline"
                    >
                        View Recipe
                    </Link>
                  </div>
                </div>
              ))}
            </ul>
          )}
        </div>
      );
    }
  
  export default HistoryPage;