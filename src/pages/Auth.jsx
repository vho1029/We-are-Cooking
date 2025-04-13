import React, { useState } from "react";
import Login from "../components/Login";
import Signup from "../components/Signup";

const Auth = () => {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-teal-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-2xl transition-all duration-300 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] hover:-translate-y-1">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-green-400 to-teal-600 bg-clip-text text-transparent">
            {showLogin ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {showLogin 
              ? "Sign in to access your meal plans" 
              : "Start your healthy meal planning journey"}
          </p>
        </div>
        
        {showLogin ? <Login /> : <Signup />}
        
        <div className="text-center">
          <button
            onClick={() => setShowLogin(!showLogin)}
            className="text-sm font-medium text-green-600 hover:text-green-500 transition-colors duration-200"
          >
            {showLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
