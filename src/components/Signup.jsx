import { useState } from "react";
import { supabase } from "../supabaseClient";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState(""); 
  const [dob, setDob] = useState(""); 
  const [dietary, setDietary] = useState(""); // New state for dietary preference
  const [message, setMessage] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();

    console.log("Email:", email);
    console.log("Password:", password);
    console.log("Dietary Preference:", dietary);

    // Create user in Supabase Authentication
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      console.error("Error during sign up:", authError);
      setMessage(authError.message);
      return;
    }

    // Get the authenticated user's ID
    const userId = authData.user.id;

    console.log("Authenticated user ID:", userId);

    // Insert user into the `users` table
    const userData = { 
      user_id: userId, 
      email, 
      username, 
      name, 
      DOB: dob, 
      Dietary: dietary, // Save dietary preference
      role: "user" 
    };
    console.log("Inserting user:", userData);

    const { error: dbError } = await supabase.from("users").insert([userData]);

    if (dbError) {
      console.error("Error inserting user into users table:", dbError);
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
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-700"
            required
          />
        </div>
        <div>
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
        <div>
          <input
            type="date"
            placeholder="Date of Birth"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-700"
            required
          />
        </div>
        <div>
          <label htmlFor="dietary" className="block text-gray-700 font-medium mb-2">
            Dietary Preference
          </label>
          <select
            id="dietary"
            value={dietary}
            onChange={(e) => setDietary(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-700"
            required
          >
            <option value="" disabled>
              Select your dietary preference
            </option>
            <option value="None">None</option>
            <option value="Vegan">Vegan</option>
            <option value="Vegetarian">Vegetarian</option>
            <option value="Ketogenic">Ketogenic</option>
            <option value="Paleo">Paleo</option>
          </select>
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
