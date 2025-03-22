import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import Login from "./components/Login";
import Signup from "./components/Signup";
import LogoutButton from "./components/LogoutButton";
import RecipeSearch from "./components/RecipeSearch";

function App() {
  const [session, setSession] = useState(null);
  const [userData, setUserData] = useState(null);
  const [showLogin, setShowLogin] = useState(true); // Toggle between login/signup

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        const userInfo = JSON.parse(sessionStorage.getItem("user"));
        setUserData(userInfo);
      }
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  if (session) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold">Meal Prep & Recipe App</h1>
        <p>Welcome, {userData?.username || "User"}!</p>
        <LogoutButton />
        <RecipeSearch />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold">Meal Prep & Recipe App</h1>
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
