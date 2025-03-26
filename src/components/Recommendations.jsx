import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; // adjust the path as needed

const Recommendations = ({ userId }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch cached recipes from Supabase
  const fetchRecommendations = async () => {
    try {
      // Optionally, you can filter by userId if you only want recipes cached by a specific user.
      let query = supabase.from('recipes').select('*').limit(3);
      if (userId) {
        query = query.eq('created_by', userId);
      }
      const { data, error } = await query;
      if (error) {
        throw error;
      }
      return data;
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchRecommendations()
      .then((data) => {
        setRecommendations(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, [userId]);

  if (loading) {
    return <p>Loading recommendations...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (recommendations.length === 0) {
    return <p>No recipes found. Please try caching some recipes first!</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {recommendations.map((recipe) => (
        <div key={recipe.recipe_id} className="bg-white p-4 rounded shadow">
          <img
            src={
              recipe.image_url.startsWith('http')
                ? recipe.image_url
                : `https://spoonacular.com/recipeImages/${recipe.image_url}`
            }
            alt={recipe.title}
            className="w-full h-40 object-cover rounded"
          />
          <h3 className="mt-2 font-bold text-lg">{recipe.title}</h3>
        </div>
      ))}
    </div>
  );
};

export default Recommendations;
