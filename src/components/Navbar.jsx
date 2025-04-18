import { NavLink } from "react-router-dom";
import LogoutButton from "./LogoutButton";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between py-4">
      <div className="flex gap-6">
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => 
            isActive 
              ? "font-bold text-transparent bg-gradient-to-r from-green-400 to-teal-600 bg-clip-text" 
              : "text-gray-600 hover:text-transparent hover:bg-gradient-to-r hover:from-green-400 hover:to-teal-600 hover:bg-clip-text transition-all duration-300"
          }
        >
          Recipes
        </NavLink>
        <NavLink 
          to="/mealplan" 
          className={({ isActive }) => 
            isActive 
              ? "font-bold text-transparent bg-gradient-to-r from-green-400 to-teal-600 bg-clip-text" 
              : "text-gray-600 hover:text-transparent hover:bg-gradient-to-r hover:from-green-400 hover:to-teal-600 hover:bg-clip-text transition-all duration-300"
          }
        >
          Meal Plan
        </NavLink>
        <NavLink 
          to="/favorites" 
          className={({ isActive }) => 
            isActive 
              ? "font-bold text-transparent bg-gradient-to-r from-green-400 to-teal-600 bg-clip-text" 
              : "text-gray-600 hover:text-transparent hover:bg-gradient-to-r hover:from-green-400 hover:to-teal-600 hover:bg-clip-text transition-all duration-300"
          }
        >
          Favorites
        </NavLink>
        <NavLink 
          to="/pantry" 
          className={({ isActive }) => 
            isActive 
              ? "font-bold text-transparent bg-gradient-to-r from-green-400 to-teal-600 bg-clip-text" 
              : "text-gray-600 hover:text-transparent hover:bg-gradient-to-r hover:from-green-400 hover:to-teal-600 hover:bg-clip-text transition-all duration-300"
          }
        >
          Pantry
        </NavLink>
        <NavLink 
          to="/history" 
          className={({ isActive }) => 
            isActive 
              ? "font-bold text-transparent bg-gradient-to-r from-green-400 to-teal-600 bg-clip-text" 
              : "text-gray-600 hover:text-transparent hover:bg-gradient-to-r hover:from-green-400 hover:to-teal-600 hover:bg-clip-text transition-all duration-300"
          }
        >
          History
        </NavLink>
        <NavLink 
          to="/profile" 
          className={({ isActive }) => 
            isActive 
              ? "font-bold text-transparent bg-gradient-to-r from-green-400 to-teal-600 bg-clip-text" 
              : "text-gray-600 hover:text-transparent hover:bg-gradient-to-r hover:from-green-400 hover:to-teal-600 hover:bg-clip-text transition-all duration-300"
          }
        >
          Profile
        </NavLink>
      </div>
      <LogoutButton />
    </nav>
  );
}
