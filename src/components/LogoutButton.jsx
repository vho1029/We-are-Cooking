import { supabase } from "../supabaseClient";

const LogoutButton = () => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    sessionStorage.removeItem("user"); // Clear session
    window.location.href = "/";
  };

  return (
    <button onClick={handleLogout} className="bg-red-500 text-white p-2 rounded">
      Logout
    </button>
  );
};

export default LogoutButton;
