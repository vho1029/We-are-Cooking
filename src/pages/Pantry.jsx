import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const PantryPage = ({ userData }) => {
  const [pantryItems, setPantryItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userData?.id) return;

    const fetchPantry = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("pantry")
        .select("pantry_id, name, quantity, unit, price")
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
              className="border rounded-xl p-4 shadow-sm bg-white"
            >
              <p className="text-lg font-medium">{item.name}</p>
              <p className="text-sm text-gray-700">
                {item.quantity} {item.unit}
              </p>
              <p className="text-sm text-green-600 font-semibold">
                ${item.price?.toFixed(2) ?? "0.00"}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PantryPage;
