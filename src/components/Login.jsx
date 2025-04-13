import { useState } from "react";
import { supabase } from "../supabaseClient";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Authenticate the user
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setMessage(authError.message);
      return;
    }

    // Get user ID
    const userId = authData.user.id;

    // Fetch user data from the `users` table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("username, role")
      .eq("user_id", userId)
      .single();

    if (userError) {
      setMessage(userError.message);
      return;
    }

    // Store user info in sessionStorage (or state management)
    sessionStorage.setItem("user", JSON.stringify(userData));

    setMessage("Login successful! Redirecting...");
    window.location.href = "/dashboard";
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Login</h2>
      <form onSubmit={handleLogin} className="mt-8 space-y-6">
        <div className="-space-y-px rounded-md shadow-sm">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 
                     placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 
                     focus:border-green-500 focus:z-10 sm:text-sm transition-all duration-300 hover:border-green-400"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-4 appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 
                     placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 
                     focus:border-green-500 focus:z-10 sm:text-sm transition-all duration-300 hover:border-green-400"
            required
          />
        </div>
        <button 
          type="submit" 
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md 
                   shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-400 
                   to-teal-600 hover:from-green-500 hover:to-teal-700 focus:outline-none 
                   focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300"
        >
          Sign In
        </button>
        {message && (
          <p className={`mt-2 text-sm ${message.includes("successful") ? "text-green-600" : "text-red-600"}`}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
};

export default Login;
