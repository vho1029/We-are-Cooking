import React from 'react';
import { Link } from 'react-router-dom';
import FavoriteButton from './FavoriteButton';

const RecipeCard = ({ recipe, userId, description }) => {
  // Format currency if available
  const formatCurrency = (amount) => {
    if (!amount) return null;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
      <Link to={`/recipe/${recipe.id}`}>
        <div className="relative h-48">
          <img 
            src={recipe.image} 
            alt={recipe.title}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://spoonacular.com/recipeImages/${recipe.id}-480x360.jpg`;
            }}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
            <h3 className="text-white font-bold text-lg p-4">
              {recipe.title}
            </h3>
          </div>
        </div>
      </Link>
      
      <div className="p-4">
        {description && (
          <p className="text-gray-600 text-sm mb-3">{description}</p>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex flex-col space-y-2">
            {/* Ready in minutes */}
            <div className="flex items-center text-sm text-gray-500">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
              </svg>
              {recipe.readyInMinutes || '30'} min
            </div>
            
            {/* Servings if available */}
            {recipe.servings && (
              <div className="flex items-center text-sm text-gray-500">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                {recipe.servings}
              </div>
            )}

            {/* Price if available */}
            {(recipe.totalPrice || recipe.pricePerServing) && (
              <div className="text-sm font-semibold text-green-600">
                {formatCurrency(recipe.totalPrice || (recipe.pricePerServing * recipe.servings / 100))}
              </div>
            )}
          </div>
          
          {/* Favorite button if userId is provided */}
          {userId && <FavoriteButton recipeId={recipe.id} userId={userId} />}
        </div>
        
        <Link 
          to={`/recipe/${recipe.id}`}
          className="block text-center mt-3 px-4 py-2 rounded-md bg-green-500 text-white hover:bg-green-600 font-medium transition-colors"
          aria-label={`View details for ${recipe.title}`}
        >
          View Recipe
        </Link>
      </div>
    </div>
  );
};

export default RecipeCard;