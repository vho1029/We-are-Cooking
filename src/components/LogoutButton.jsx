import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    sessionStorage.clear();
    navigate("/"); // Redirect to login screen
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-500 text-white px-4 py-2 rounded"
    >
      Logout
    </button>
  );
}
