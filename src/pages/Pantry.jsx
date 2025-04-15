import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { FaTrash, FaMinus, FaPlus } from 'react-icons/fa';

const PantryPage = ({ userData }) => {
  const [pantryItems, setPantryItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userData?.id) return;

    const fetchPantry = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("pantry")
        .select("pantry_id, name, quantity, unit, price, added_at")
        .eq("user_id", userData.id)
        .order("added_at", { ascending: false });

      if (error) {
        console.error("Error fetching pantry items:", error);
      } else {
        setPantryItems(data);
      }

      setLoading(false);
    };

    fetchPantry();
  }, [userData]);

  const handleRemoveItem = async (pantryId) => {
    try {
      const { error } = await supabase
        .from('pantry')
        .delete()
        .eq('pantry_id', pantryId);
        
      if (error) throw error;
      
      // Update UI after removal
      setPantryItems(pantryItems.filter(item => item.pantry_id !== pantryId));
    } catch (err) {
      console.error('Error removing item:', err);
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
      const { error } = await supabase
        .from('pantry')
        .update({ quantity: newQuantity })
        .eq('pantry_id', pantryId);
        
      if (error) throw error;
      
      // Update UI after quantity change
      setPantryItems(pantryItems.map(item => 
        item.pantry_id === pantryId 
          ? { ...item, quantity: newQuantity } 
          : item
      ));
    } catch (err) {
      console.error('Error updating quantity:', err);
    }
  };

  if (loading) return <p>Loading pantry...</p>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">My Pantry</h1>
      <div className="space-y-3">
        {pantryItems.length === 0 ? (
          <p>No ingredients in your pantry yet.</p>
        ) : (
          pantryItems.map((item) => (
            <div
              key={item.pantry_id}
              className="border rounded-xl p-4 shadow-sm bg-white flex justify-between items-center"
            >
              <div>
                <p className="text-lg font-medium">{item.name}</p>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleUpdateQuantity(item.pantry_id, item.quantity, -1)}
                    className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    <FaMinus size={12} />
                  </button>
                  <p className="text-sm text-gray-700">
                    {item.quantity} {item.unit}
                  </p>
                  <button 
                    onClick={() => handleUpdateQuantity(item.pantry_id, item.quantity, 1)}
                    className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    <FaPlus size={12} />
                  </button>
                </div>
                <p className="text-sm text-green-600 font-semibold">
                  ${item.price?.toFixed(2) ?? "0.00"}
                </p>
              </div>
              
              <button
                onClick={() => handleRemoveItem(item.pantry_id)}
                className="text-red-500 hover:text-red-700"
              >
                <FaTrash />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PantryPage;