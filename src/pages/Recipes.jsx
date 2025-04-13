import React from "react";
import RecipeSearch from "../components/RecipeSearch";
import Recommendations from "../components/Recommendations";

export default function RecipesPage({ userData }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Top Section: Search */}
        <section className="bg-white p-4 rounded shadow">
          <RecipeSearch userData={userData} />
        </section>

        {/* Middle Section: Recommended Recipes */}
        <section className="bg-white p-4 rounded shadow">
          <h2 className="text-2xl font-bold mb-4">Recommended Recipes</h2>
          <Recommendations />
        </section>

        {/* Bottom Section: Placeholder */}
        <section className="bg-white p-4 rounded shadow">
          <h2 className="text-2xl font-bold mb-2">Placeholder / Extra Info</h2>
          <p className="text-gray-600">
            Here you can add more content or stats in the future, such as
            nutritional insights, user progress, or upcoming meal plans.
          </p>
        </section>
      </main>
    </div>
  );
}
