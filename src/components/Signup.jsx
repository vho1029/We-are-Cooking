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
    <div className="p-4">
      <h2 className="text-xl font-bold">Create an Account</h2>
      <form onSubmit={handleSignup} className="mt-4">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border p-2 rounded w-full"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded w-full mt-2"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded w-full mt-2"
          required
        />
        <button type="submit" className="bg-green-500 text-white p-2 mt-2 rounded">
          Sign Up
        </button>
      </form>
      {message && <p className="mt-2 text-red-500">{message}</p>}
    </div>
  );
};

export default Signup;
