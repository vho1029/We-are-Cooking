import { NavLink } from "react-router-dom";
import LogoutButton from "./LogoutButton";
import { FaHeart } from "react-icons/fa"; // ✅ Importing heart icon

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between py-4">
      <div className="flex gap-6">
        <NavLink
          to="/recipes"
          className={({ isActive }) =>
            isActive ? "font-bold text-green-600" : ""
          }
        >
          Recipes
        </NavLink>

        <NavLink
          to="/mealplan"
          className={({ isActive }) =>
            isActive ? "font-bold text-green-600" : ""
          }
        >
          Meal Plan
        </NavLink>

        <NavLink
          to="/favorites"
          className={({ isActive }) =>
            isActive ? "font-bold text-green-600 flex items-center gap-1" : "flex items-center gap-1"
          }
        >
          <FaHeart /> Favorites
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            isActive ? "font-bold text-green-600" : ""
          }
        >
          Profile
        </NavLink>
      </div>

      <LogoutButton />
    </nav>
  );
}
