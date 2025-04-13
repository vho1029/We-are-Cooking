import { NavLink } from "react-router-dom";
import LogoutButton from "./LogoutButton";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between py-4">
      <div className="flex gap-6">
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? "font-bold text-green-600" : ""}>
          Recipes
        </NavLink>
        <NavLink to="/mealplan" className={({ isActive }) => isActive ? "font-bold text-green-600" : ""}>
          Meal Plan
        </NavLink>
        <NavLink to="/favorites" className={({ isActive }) => isActive ? "font-bold text-green-600" : ""}>
          Favorites
        </NavLink>
        <NavLink to="/pantry" className={({ isActive }) => isActive ? "font-bold text-green-600" : ""}>
          Pantry
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => isActive ? "font-bold text-green-600" : ""}>
          Profile
        </NavLink>
      </div>
      <LogoutButton />
    </nav>
  );
}
