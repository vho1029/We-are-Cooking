import React from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

const Profile = ({ userData }) => {
  const navigate = useNavigate();

  const handleChangeAccount = async () => {
    // Sign out the current user
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
    } else {
      // Clear local user data if needed and navigate to login screen
      sessionStorage.clear();
      navigate("/");
    }
  };

  if (!userData) {
    return <p>No user data available.</p>;
  }

  return (
    <div className="p-4 bg-white rounded shadow-md max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Profile</h2>
      <div className="mb-3">
        <strong>Username:</strong>{" "}
        <span>{userData.username ? userData.username : "N/A"}</span>
      </div>
      <div className="mb-6">
        <strong>Email:</strong> <span>{userData.email}</span>
      </div>
      <button
        onClick={handleChangeAccount}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Change Account
      </button>
    </div>
  );
};

export default Profile;
