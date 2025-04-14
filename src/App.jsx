import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

// React Router imports
import { Routes, Route, Navigate } from "react-router-dom";

// Global styles
import "./index.css";

// Components & Pages
import Login from "./components/Login";
import Signup from "./components/Signup";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import UpdateProfile from "./components/UpdateProfile";

// Renamed pages:
// - RecipesPage is now the renamed Dashboard (originally Dashboard.jsx, renamed to Recipes.jsx)
import RecipesPage from "./pages/Recipes";
// - MealPlanPage is now the renamed original Recipes page (renamed to MealPlan.jsx)
import MealPlanPage from "./pages/MealPlan";

import Favorites from "./pages/Favorites";
import Profile from "./pages/Profile";
import RecipeDetails from "./pages/RecipeDetails";
import PantryPage from "./pages/Pantry";
import Auth from "./pages/Auth";

function App() {
  const [session, setSession] = useState(null);
  const [userData, setUserData] = useState(null);
  const [showLogin, setShowLogin] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        // Use session.user for user details
        setUserData(session.user);
        // Also save to sessionStorage if desired
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
    // Logged In: Show Navbar + Pages
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold">Meal Prep & Recipe App</h1>
        {/* Navbar for navigation */}
        <Navbar />

        {/* Define routes for your app */}
        <Routes>
          {/* Redirect / to /recipes */}
          <Route path="/" element={<Navigate to="/recipes" />} />

          {/* Main pages */}
          <Route path="/recipes" element={<RecipesPage userData={userData} />} />
          <Route path="/mealplan" element={<MealPlanPage userData={userData}/>} />
          <Route path="/favorites" element={<Favorites userData={userData}/>} />
          <Route path="/pantry" element={<PantryPage userData={userData}/>} />
          <Route path="/profile" element={<Profile userData={userData} />} />
          <Route path="/recipe/:id" element={<RecipeDetails />} />
          <Route path="/update-profile" element={<UpdateProfile />} />

          {/* Catch-all: If no route matches, go to /recipes */}
          <Route path="*" element={<Navigate to="/recipes" />} />
        </Routes>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Hero />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
