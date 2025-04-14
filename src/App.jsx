import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { Routes, Route, Navigate } from "react-router-dom";

import "./index.css";

// Components & Pages
import Login from "./components/Login";
import Signup from "./components/Signup";
import Navbar from "./components/Navbar";
import UpdateProfile from "./components/UpdateProfile";

import RecipesPage from "./pages/Recipes";
import MealPlanPage from "./pages/MealPlan";
import Favorites from "./pages/Favorites";
import Profile from "./pages/Profile";
import RecipeDetails from "./pages/RecipeDetails";
import GroceryList from "./pages/GroceryList"; // ✅ Grocery list page

function App() {
  const [session, setSession] = useState(null);
  const [userData, setUserData] = useState(null);
  const [showLogin, setShowLogin] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        setUserData(session.user);
        sessionStorage.setItem("user", JSON.stringify(session.user));
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        setUserData(session.user);
        sessionStorage.setItem("user", JSON.stringify(session.user));
      } else {
        setUserData(null);
        sessionStorage.removeItem("user");
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  if (session) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">Meal Prep & Recipe App</h1>
        <Navbar />

        <Routes>
          <Route path="/" element={<Navigate to="/recipes" />} />
          <Route path="/recipes" element={<RecipesPage userData={userData} />} />
          <Route path="/mealplan" element={<MealPlanPage />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/profile" element={<Profile userData={userData} />} />
          <Route path="/recipe/:id" element={<RecipeDetails />} />
          <Route path="/update-profile" element={<UpdateProfile />} />
          <Route path="/grocerylist" element={<GroceryList />} />
          <Route path="*" element={<Navigate to="/recipes" />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Meal Prep & Recipe App</h1>
      {showLogin ? <Login /> : <Signup />}
      <button
        className="mt-4 text-blue-500 underline"
        onClick={() => setShowLogin(!showLogin)}
      >
        {showLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
      </button>
    </div>
  );
}

export default App;
