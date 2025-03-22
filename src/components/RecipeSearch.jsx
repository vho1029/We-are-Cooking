import { useState } from "react";
import { fetchRecipes } from "../api"; // Ensure api.js is set up

const RecipeSearch = () => {
  const [query, setQuery] = useState("");
  const [recipes, setRecipes] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    const data = await fetchRecipes(query);
    setRecipes(data);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Search Recipes</h2>
      <form onSubmit={handleSearch} className="mt-4">
        <input
          type="text"
          placeholder="Search for a recipe..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border p-2 rounded w-64"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 ml-2 rounded">
          Search
        </button>
      </form>
      <div className="mt-4">
        {recipes.map((recipe) => (
          <div key={recipe.id} className="border p-2 my-2 rounded">
            <h3 className="font-bold">{recipe.title}</h3>
            <img src={recipe.image} alt={recipe.title} className="w-32 h-32 object-cover mt-2" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecipeSearch;
