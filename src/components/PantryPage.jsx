import React, { useState, useEffect } from 'react';
import { pantryService } from '../services/pantryService';
import { FaTrash, FaMinus, FaPlus } from 'react-icons/fa';

const PantryPage = ({ userData }) => {
  const [pantryItems, setPantryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPantryItems = async () => {
      if (!userData?.id) return;
      
      setLoading(true);
      try {
        const items = await pantryService.getUserPantry(userData.id);
        setPantryItems(items);
      } catch (err) {
        console.error('Error fetching pantry items:', err);
        setError('Failed to load pantry items. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPantryItems();
  }, [userData?.id]);

  const handleRemoveItem = async (pantryId) => {
    try {
      await pantryService.removeFromPantry(pantryId);
      // Update UI after removal
      setPantryItems(pantryItems.filter(item => item.pantry_id !== pantryId));
    } catch (err) {
      console.error('Error removing item:', err);
      setError('Failed to remove item. Please try again.');
    }
  };

  const handleUpdateQuantity = async (pantryId, currentQuantity, change) => {
    const newQuantity = Math.max(0, currentQuantity + change);
    
    if (newQuantity === 0) {
      // If quantity becomes 0, remove the item
      await handleRemoveItem(pantryId);
      return;
    }
    
    try {
      await pantryService.updatePantryItemQuantity(pantryId, newQuantity);
      // Update UI after quantity change
      setPantryItems(pantryItems.map(item => 
        item.pantry_id === pantryId 
          ? { ...item, quantity: newQuantity } 
          : item
      ));
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
    </div>
  );
};

export default PantryPage;