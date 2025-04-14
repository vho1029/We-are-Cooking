import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getRandomRecipes } from '../api';

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        // Get 6 random recipes for recommendations
        const recipes = await getRandomRecipes(6);
        setRecommendations(recipes);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError('Failed to load recommended recipes');
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  if (loading) {
    return <p className="text-center py-4">Loading recommendations...</p>;
  }

  if (error) {
    return (
      <p className="text-center py-4 text-red-500">
        {error}
      </p>
    );
  }

  if (recommendations.length === 0) {
    return (
      <p className="text-center py-4">
        No recommendations available at the moment.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {recommendations.map((recipe) => (
        <Link 
          to={`/recipe/${recipe.id}`}
          key={recipe.id} 
          className="block bg-white p-4 rounded shadow hover:shadow-md transition-shadow duration-200"
        >
          {recipe.image && (
            <img
              src={recipe.image}
              alt={recipe.title}
              className="w-full h-40 object-cover rounded"
            />
          )}
          <h3 className="mt-2 font-bold text-lg">{recipe.title}</h3>
          <div className="mt-2 flex justify-between text-sm text-gray-600">
            <span>{recipe.readyInMinutes} mins</span>
            <span>{recipe.servings} servings</span>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default Recommendations;