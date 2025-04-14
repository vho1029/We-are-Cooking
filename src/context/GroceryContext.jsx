import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

const GroceryContext = createContext();

export const GroceryProvider = ({ children }) => {
  const [groceryList, setGroceryList] = useState([]);

  useEffect(() => {
    const fetchGroceryList = async () => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;

      const { data, error } = await supabase
        .from("grocery_list")
        .select("*")
        .eq("user_id", user.id);

      if (!error) {
        setGroceryList(data);
      }
    };

    fetchGroceryList();
  }, []);

  const addIngredients = async (newItems) => {
    const updated = [...groceryList];
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;

    for (const item of newItems) {
      const existing = updated.find(i => i.name === item.name);

      if (existing) {
        existing.weight += item.weight;
        existing.price += item.price;
      } else {
        const { data, error } = await supabase.from("grocery_list").insert([
          {
            user_id: user.id,
            name: item.name,
            weight: item.weight,
            price: item.price,
          },
        ]).select();

        if (!error && data && data.length > 0) {
          updated.push(data[0]);
        }
      }
    }

    setGroceryList(updated);
  };

  const deleteIngredient = async (id) => {
    const { error } = await supabase.from("grocery_list").delete().eq("id", id);
    if (!error) {
      setGroceryList((prev) => prev.filter(item => item.id !== id));
    }
  };

  const clearGroceryList = async () => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;

    const { error } = await supabase
      .from("grocery_list")
      .delete()
      .eq("user_id", user.id);

    if (!error) {
      setGroceryList([]);
    }
  };

  return (
    <GroceryContext.Provider
      value={{ groceryList, addIngredients, deleteIngredient, clearGroceryList }}
    >
      {children}
    </GroceryContext.Provider>
  );
};

export const useGrocery = () => useContext(GroceryContext);
