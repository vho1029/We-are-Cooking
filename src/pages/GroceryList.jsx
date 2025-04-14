import { useGrocery } from "../context/GroceryContext";

export default function GroceryList() {
  const {
    groceryList,
    deleteIngredient,
    clearGroceryList,
  } = useGrocery();

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">🛒 Grocery List</h2>

      {groceryList.length === 0 ? (
        <p className="text-gray-600">No items in your grocery list yet.</p>
      ) : (
        <>
          <ul className="space-y-2 mb-4">
            {groceryList.map((item) => (
              <li
                key={item.id}
                className="flex justify-between items-center p-3 bg-white shadow rounded border"
              >
                <span>
                  <strong>{item.name}</strong>: {item.weight}g — $
                  {item.price.toFixed(2)}
                </span>
                <button
                  onClick={() => deleteIngredient(item.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  🗑 Delete
                </button>
              </li>
            ))}
          </ul>

          <button
            onClick={clearGroceryList}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
          >
            Clear Grocery List
          </button>
        </>
      )}
    </div>
  );
}
