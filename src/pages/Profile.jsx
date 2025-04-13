import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      console.log("Fetching user data...");
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        console.error("No authenticated user found or error occurred:", error);
        setLoading(false);
        navigate("/login"); // Redirect to login page
        return;
      }

      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (error) {
          console.error("Error fetching user data:", error);
        } else {
          console.log("Fetched user data:", data); // Debugging log
          setUserData(data);
        }
      } catch (err) {
        console.error("Unexpected error fetching user data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleChangeAccount = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
    } else {
      sessionStorage.clear();
      navigate("/");
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!userData) {
    return <p>No user data available.</p>;
  }

  return (
    <div className="p-4 bg-white rounded shadow-md max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Profile</h2>
      <div className="mb-3">
        <strong>Name:</strong>{" "}
        <span>{userData.name || "N/A"}</span>
      </div>
      <div className="mb-3">
        <strong>Username:</strong>{" "}
        <span>{userData.username || "N/A"}</span>
      </div>
      <div className="mb-3">
        <strong>Email:</strong>{" "}
        <span>{userData.email || "N/A"}</span>
      </div>
      <div className="mb-3">
        <strong>Date of Birth:</strong>{" "}
        <span>{userData.DOB || "N/A"}</span>
      </div>
      <div className="mb-6">
        <strong>Dietary:</strong>{" "}
        <span>{userData.Dietary || "N/A"}</span>
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleChangeAccount}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Change Account
        </button>

        {/* Button to navigate to the update page */}
        <button
          onClick={() => navigate("/update-profile")}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Update Profile
        </button>
      </div>
    </div>
  );
};

export default Profile;
