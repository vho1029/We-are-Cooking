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
      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-700"
            required
          />
        </div>
        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-700"
            required
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-700"
            required
          />
        </div>
        <button 
          type="submit" 
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-md transition duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          Sign Up
        </button>
      </form>
      {message && (
        <p className={`mt-4 p-3 rounded-md ${message.includes("successful") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"} font-medium`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default Signup;
