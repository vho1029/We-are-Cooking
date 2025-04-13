import { useState } from "react";
import { supabase } from "../supabaseClient";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    
    // Create user in Supabase Authentication
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setMessage(authError.message);
      return;
    }

    // Get the authenticated user's ID
    const userId = authData.user.id;

    // Insert user into the `users` table
    const { error: dbError } = await supabase.from("users").insert([
      { user_id: userId, email, username, role: "user" },
    ]);

    if (dbError) {
      setMessage(dbError.message);
    } else {
      setMessage("Signup successful! Check your email for verification.");
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Create an Account</h2>
      <form onSubmit={handleSignup} className="mt-8 space-y-6">
        <div className="-space-y-px rounded-md shadow-sm">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 
                     placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 
                     focus:border-green-500 focus:z-10 sm:text-sm transition-all duration-300 hover:border-green-400"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-4 appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 
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
          Sign Up
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

export default Signup;
