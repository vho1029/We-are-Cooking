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
      <form onSubmit={handleLogin} className="mt-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded w-full"
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
        <button type="submit" className="bg-blue-500 text-white p-2 mt-2 rounded">
          Login
        </button>
      </form>
      {message && <p className="mt-2 text-red-500">{message}</p>}
    </div>
  );
};

export default Login;
