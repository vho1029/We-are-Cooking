import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

const UpdateProfile = () => {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState(""); // For re-authentication
  const [newPassword, setNewPassword] = useState(""); // For updating password
  const [Dietary, setDietary] = useState(""); // For updating dietary preference
  const navigate = useNavigate();

  // Handle updating name
  const handleUpdateName = async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("No authenticated user found or error occurred:", authError);
      return;
    }

    if (!name) {
      alert("Please enter a name to update.");
      return;
    }

    const { error } = await supabase
      .from("users")
      .update({ name })
      .eq("user_id", user.id);

    if (error) {
      console.error("Error updating name:", error);
      alert("Failed to update name. Please try again.");
    } else {
      console.log("Name updated successfully!");
      alert("Your name has been updated.");
    }
  };

  // Handle updating username
  const handleUpdateUsername = async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("No authenticated user found or error occurred:", authError);
      return;
    }

    if (!username) {
      alert("Please enter a username to update.");
      return;
    }

    const { error } = await supabase
      .from("users")
      .update({ username })
      .eq("user_id", user.id);

    if (error) {
      console.error("Error updating username:", error);
      alert("Failed to update username. Please try again.");
    } else {
      console.log("Username updated successfully!");
      alert("Your username has been updated.");
    }
  };

  // Handle updating email
  const handleUpdateEmail = async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("No authenticated user found or error occurred:", authError);
      return;
    }

    console.log("Re-authenticating user with email:", user.email);

    // Re-authenticate the user with their current password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email, // Use the authenticated user's current email
      password: currentPassword,
    });

    if (signInError) {
      console.error("Error re-authenticating user:", signInError);
      alert("Invalid current password. Please try again.");
      return;
    }

    console.log("Re-authentication successful!");

    // Update email in the authentication database
    const { error } = await supabase.auth.updateUser({ email });

    if (error) {
      console.error("Error updating email in authentication database:", error);
      alert("Failed to update email in authentication database. Please try again.");
      return;
    } else {
      console.log("Email updated successfully in authentication database!");
    }

    // Update email in the `users` table
    const { error: emailDbError } = await supabase
      .from("users")
      .update({ email }) // Use "email" for the users table
      .eq("user_id", user.id);

    if (emailDbError) {
      console.error("Error updating email in users table:", emailDbError);
      alert("Failed to update email in users table. Please try again.");
      return;
    } else {
      console.log("Email updated successfully in users table!");
    }

    // Sign the user out after updating email
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      console.error("Error signing out user:", signOutError);
      alert("Failed to sign out. Please try again.");
      return;
    }

    alert("Your email has been updated. Please log in again.");
    navigate("/login");
  };

  // Handle updating password
  const handleUpdatePassword = async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("No authenticated user found or error occurred:", authError);
      return;
    }

    console.log("Re-authenticating user with email:", user.email);

    // Re-authenticate the user with their current password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email, // Use the authenticated user's current email
      password: currentPassword,
    });

    if (signInError) {
      console.error("Error re-authenticating user:", signInError);
      alert("Invalid current password. Please try again.");
      return;
    }

    console.log("Re-authentication successful!");

    // Update password in the authentication database
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      console.error("Error updating password in authentication database:", error);
      alert("Failed to update password in authentication database. Please try again.");
      return;
    } else {
      console.log("Password updated successfully in authentication database!");
    }

    // Sign the user out after updating password
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      console.error("Error signing out user:", signOutError);
      alert("Failed to sign out. Please try again.");
      return;
    }

    alert("Your password has been updated. Please log in again.");
    navigate("/login");
  };

  // Handle updating dietary preference
  const handleUpdateDietary = async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("No authenticated user found or error occurred:", authError);
      return;
    }

    if (!Dietary) {
      alert("Please select a dietary preference to update.");
      return;
    }

    const { error } = await supabase
      .from("users")
      .update({ Dietary })
      .eq("user_id", user.id);

    if (error) {
      console.error("Error updating dietary preference:", error);
      alert("Failed to update dietary preference. Please try again.");
    } else {
      console.log("Dietary preference updated successfully!");
      alert("Your dietary preference has been updated.");
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow-md max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Update Profile</h2>

      {/* Section for updating name */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Update Name</h3>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />
        <button
          onClick={handleUpdateName}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Save Name
        </button>
      </div>

      {/* Section for updating username */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Update Username</h3>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />
        <button
          onClick={handleUpdateUsername}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Save Username
        </button>
      </div>

      {/* Section for updating email */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Update Email</h3>
        <input
          type="email"
          placeholder="New Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />
        <input
          type="password"
          placeholder="Current Password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />
        <button
          onClick={handleUpdateEmail}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Save Email
        </button>
      </div>

      {/* Section for updating password */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Update Password</h3>
        <input
          type="password"
          placeholder="Current Password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />
        <button
          onClick={handleUpdatePassword}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Save Password
        </button>
      </div>

      {/* Section for updating dietary preference */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Update Dietary Preference</h3>
        <select
          value={Dietary}
          onChange={(e) => setDietary(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        >
          <option value="" disabled>
            Select your dietary preference
          </option>
          <option value="Vegan">Vegan</option>
          <option value="Vegetarian">Vegetarian</option>
          <option value="Ketogenic">Ketogenic</option>
          <option value="Paleo">Paleo</option>
        </select>
        <button
          onClick={handleUpdateDietary}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
        >
          Save Dietary Preference
        </button>
      </div>
    </div>
  );
};

export default UpdateProfile;