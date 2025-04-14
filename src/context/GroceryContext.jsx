import { createContext, useContext, useState } from "react";

const GroceryContext = createContext();

export const GroceryProvider = ({ children }) => {
  const [groceryList, setGroceryList] = useState([]);

  const addIngredients = (newItems) => {
    const updated = [...groceryList];

    newItems.forEach((item) => {
      const existing = updated.find(i => i.name === item.name);
      if (existing) {
        existing.weight += item.weight;
        existing.price += item.price;
      } else {
        updated.push({ ...item });
      }
    });

    setGroceryList(updated);
  };

  return (
    <GroceryContext.Provider value={{ groceryList, addIngredients }}>
      {children}
    </GroceryContext.Provider>
  );
};

export const useGrocery = () => useContext(GroceryContext);
