import React from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import toast, { Toaster } from "react-hot-toast";

// Import pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PropertiesPage from "./pages/PropertiesPage";
import PropertyDetail from "./pages/PropertyDetail";
import TenantDashboard from "./pages/TenantDashboard";
import LandlordDashboard from "./pages/LandlordDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AddProperty from "./pages/AddProperty";
import MyProperties from "./pages/MyProperties";
import AdminProperties from "./pages/AdminProperties";
import EditProperty from "./pages/EditProperty";
// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    navigate("/");
    toast.error("You do not have access to this page");
    return null;
  }

  return children;
};

// Navbar Component
const Navbar = () => {
  const { user, logout } = useAuth();
  const [showLandlordMenu, setShowLandlordMenu] = React.useState(false);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            RentEase
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/properties"
              className="text-gray-600 hover:text-blue-600 transition"
            >
              Properties
            </Link>

            {user && (
              <>
                {user.role === "admin" && (
                  <Link
                    to="/admin"
                    className="text-gray-600 hover:text-blue-600 transition"
                  >
                    Admin Panel
                  </Link>
                )}

                {user.role === "landlord" && (
                  <div className="relative">
                    <button
                      onClick={() => setShowLandlordMenu(!showLandlordMenu)}
                      className="text-gray-600 hover:text-blue-600 transition flex items-center gap-1"
                    >
                      Dashboard ▼
                    </button>
                    {showLandlordMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-2 z-50">
                        <Link
                          to="/landlord"
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowLandlordMenu(false)}
                        >
                          Overview
                        </Link>
                        <Link
                          to="/landlord/my-properties"
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowLandlordMenu(false)}
                        >
                          My Properties
                        </Link>
                        <Link
                          to="/landlord/add-property"
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowLandlordMenu(false)}
                        >
                          Add Property
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {user.role === "tenant" && (
                  <Link
                    to="/tenant"
                    className="text-gray-600 hover:text-blue-600 transition"
                  >
                    My Bookings
                  </Link>
                )}

                <button
                  onClick={logout}
                  className="text-red-600 hover:text-red-700 transition"
                >
                  Logout
                </button>
              </>
            )}

            {!user && (
              <>
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-blue-600 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-gray-600">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
};

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">RentEase</h3>
            <p className="text-gray-400">Find your perfect home with ease</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link to="/properties" className="hover:text-white">
                  Browse Properties
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white">
                  Register
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Support</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#" className="hover:text-white">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Terms & Conditions
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Contact</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Email: support@rentease.com</li>
              <li>Phone: +251 980 155 186</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
          <p>&copy; 2026 RentEase. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Toaster position="top-right" />
      <Navbar />
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/properties" element={<PropertiesPage />} />
          <Route path="/property/:id" element={<PropertyDetail />} />

          {/* Tenant Routes */}
          <Route
            path="/tenant/*"
            element={
              <ProtectedRoute allowedRoles={["tenant"]}>
                <TenantDashboard />
              </ProtectedRoute>
            }
          />

          {/* Landlord Routes */}
          <Route
            path="/landlord"
            element={
              <ProtectedRoute allowedRoles={["landlord", "admin"]}>
                <LandlordDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/landlord/add-property"
            element={
              <ProtectedRoute allowedRoles={["landlord"]}>
                <AddProperty />
              </ProtectedRoute>
            }
          />
          <Route
            path="/landlord/my-properties"
            element={
              <ProtectedRoute allowedRoles={["landlord"]}>
                <MyProperties />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/properties"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminProperties />
              </ProtectedRoute>
            }
          />
          <Route
            path="/landlord"
            element={
              <ProtectedRoute allowedRoles={["landlord", "admin"]}>
                <LandlordDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/landlord/add-property"
            element={
              <ProtectedRoute allowedRoles={["landlord"]}>
                <AddProperty />
              </ProtectedRoute>
            }
          />

          <Route
            path="/landlord/my-properties"
            element={
              <ProtectedRoute allowedRoles={["landlord"]}>
                <MyProperties />
              </ProtectedRoute>
            }
          />
          <Route
            path="/landlord/edit-property/:id"
            element={
              <ProtectedRoute allowedRoles={["landlord", "admin"]}>
                <EditProperty />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;
