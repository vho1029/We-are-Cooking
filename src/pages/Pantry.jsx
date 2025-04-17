import React, { useState, useEffect } from 'react';
// Import the entire service as a default import
import pantryService from '../services/pantryService';
import { FaTrash, FaMinus, FaPlus } from 'react-icons/fa';
import { getRecipesFromPantry } from '../api';
import { Link } from "react-router-dom";

const Pantry = ({ userData }) => {
  const [pantryItems, setPantryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recommendedRecipes, setRecommendedRecipes] = useState([]);

  useEffect(() => {
    const loadPantryItems = async () => {
      if (!userData?.id) return;
      
      setLoading(true);
      try {
        console.log('Calling getUserPantry...');
        // Make sure to use the method name as defined in your pantryService object
        const items = await pantryService.getUserPantry(userData.id);
        setPantryItems(items);
        if (items.length > 0) {
          console.log('Fetching recommended recipes...');
          
          // Fetch recipe titles based on the pantry ingredients
          const recipeTitles = await getRecipesFromPantry(items);
          console.log('Recommended Recipes: ', recipeTitles);

          // After receiving the titles, pass them to getThreeRecipes to fetch 3 recipes
          const recipes = await pantryService.getThreeRecipes(recipeTitles);
          console.log('Fetched Recipes from Spoonacular', recipes);
          setRecommendedRecipes(recipes);
        }
      } catch (err) {
        console.error('Error fetching pantry items:', err);
        setError('Failed to load pantry items. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadPantryItems();
  }, [userData?.id]);

  const handleRemoveItem = async (pantryId) => {
    if (!userData?.id) return;
    
    try {
      console.log('Calling removeFromPantry...');
      // Make sure to use the method name as defined in your pantryService object
      const result = await pantryService.removeFromPantry(pantryId, userData.id);
      
      if (result.success) {
        // Update UI after successful removal
        setPantryItems(pantryItems.filter(item => item.pantry_id !== pantryId));
      } else {
        setError(result.error || 'Failed to remove item');
      }
    } catch (err) {
      console.error('Error removing item:', err);
      setError('Failed to remove item. Please try again.');
    }
  };

  const handleUpdateQuantity = async (pantryId, currentQuantity, change) => {
    if (!userData?.id) return;
    
    const newQuantity = Math.max(0, currentQuantity + change);
    
    if (newQuantity === 0) {
      // If quantity becomes 0, remove the item
      await handleRemoveItem(pantryId);
      return;
    }
    
    try {
      console.log('Calling updatePantryItemQuantity...');
      // Make sure to use the method name as defined in your pantryService object
      const result = await pantryService.updatePantryItemQuantity(pantryId, newQuantity, userData.id);
      
      if (result.success) {
        // Update UI after successful quantity change
        setPantryItems(pantryItems.map(item => 
          item.pantry_id === pantryId 
            ? { ...item, quantity: newQuantity } 
            : item
        ));
      } else {
        setError(result.error || 'Failed to update quantity');
      }
    } catch (err) {
      console.error('Error updating quantity:', err);
      setError('Failed to update quantity. Please try again.');
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6 bg-red-50 text-red-600 rounded-lg">
        <p>{error}</p>
        <button 
          className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-green-600"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">My Pantry</h1>
      
      {pantryItems.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-custom-light text-center">
          <h2 className="text-xl font-medium text-gray-700 mb-4">Your pantry is empty</h2>
          <p className="text-gray-600 mb-6">
            Add ingredients to your pantry from recipes to keep track of what you have on hand.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-custom-light overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ingredient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Added On
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pantryItems.map((item) => (
                  <tr key={item.pantry_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleUpdateQuantity(item.pantry_id, item.quantity, -1)}
                          className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                        >
                          <FaMinus size={12} />
                        </button>
                        <span className="text-sm text-gray-900">{item.quantity}</span>
                        <button 
                          onClick={() => handleUpdateQuantity(item.pantry_id, item.quantity, 1)}
                          className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                        >
                          <FaPlus size={12} />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{item.unit}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatCurrency(item.price)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(item.added_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleRemoveItem(item.pantry_id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <div className="mt-12">
        <h2 className="text-xl font-medium mb-6">Recommended Recipes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendedRecipes.length > 0 ? (
              recommendedRecipes.map((recipe) => (
                <div key={recipe.id} className="bg-white p-4 rounded-lg shadow-md">
                  <img
                    src={recipe.image}
                    alt={recipe.title}
                    className="w-full h-48 object-cover rounded-md mb-4"
                  />
                  <h3 className="text-lg font-semibold text-gray-800">{recipe.title}</h3>
                  <Link 
                    to={`/recipe/${recipe.id}`} 
                    className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-green-600 text-center block"
                  >
                    View Recipe
                  </Link>
                </div>
              ))
            ) : (
              <p>No recommended recipes found.</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default Pantry;