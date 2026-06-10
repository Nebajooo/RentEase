import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FaHome,
  FaSearch,
  FaUser,
  FaBars,
  FaTimes,
  FaBuilding,
} from "react-icons/fa";

const Navbar = () => {
  const { user, isAuthenticated, logout, isLandlord, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getDashboardLink = () => {
    if (isAdmin) return "/admin";
    if (isLandlord) return "/landlord";
    return "/tenant";
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <FaHome className="text-primary text-2xl" />
            <span className="text-xl font-bold text-dark">RentEase</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/properties"
              className="text-gray-600 hover:text-primary transition"
            >
              Browse Properties
            </Link>

            {isAuthenticated && (
              <Link
                to={getDashboardLink()}
                className="text-gray-600 hover:text-primary transition"
              >
                Dashboard
              </Link>
            )}

            {isLandlord && (
              <Link to="/landlord/add-property" className="btn-primary text-sm">
                List Property
              </Link>
            )}

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link to="/profile" className="flex items-center space-x-2">
                  <img
                    src={
                      user?.avatar ||
                      `https://ui-avatars.com/api/?name=${user?.name}`
                    }
                    alt={user?.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="text-gray-700">{user?.name}</span>
                </Link>
                <button
                  onClick={logout}
                  className="text-red-500 hover:text-red-600"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-600 hover:text-primary">
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-2xl"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-3">
              <Link
                to="/properties"
                className="text-gray-600 hover:text-primary"
              >
                Browse Properties
              </Link>

              {isAuthenticated && (
                <Link
                  to={getDashboardLink()}
                  className="text-gray-600 hover:text-primary"
                >
                  Dashboard
                </Link>
              )}

              {isLandlord && (
                <Link
                  to="/landlord/add-property"
                  className="btn-primary text-center"
                >
                  List Property
                </Link>
              )}

              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    className="text-gray-600 hover:text-primary"
                  >
                    Profile
                  </Link>
                  <button onClick={logout} className="text-red-500 text-left">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-primary"
                  >
                    Login
                  </Link>
                  <Link to="/register" className="btn-primary text-center">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
