import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    users: { total: 0, landlords: 0, tenants: 0 },
    properties: { total: 0, available: 0, pending: 0 },
    bookings: { total: 0, pending: 0, active: 0, completed: 0 },
    revenue: 0,
  });
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [pendingProperties, setPendingProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch all data in parallel
      const [statsRes, usersRes, propertiesRes, pendingRes, bookingsRes] =
        await Promise.all([
          axios.get("/api/admin/stats", { headers }),
          axios.get("/api/admin/users", { headers }),
          axios.get("/api/admin/properties", { headers }),
          axios.get("/api/admin/pending-properties", { headers }),
          axios.get("/api/admin/bookings", { headers }),
        ]);

      setStats(statsRes.data.stats);
      setUsers(usersRes.data.users || []);
      setProperties(propertiesRes.data.properties || []);
      setPendingProperties(pendingRes.data.properties || []);
      setBookings(bookingsRes.data.bookings || []);

      console.log("Admin data loaded successfully");
    } catch (error) {
      console.error("Error fetching admin data:", error);
      setError(
        error.response?.data?.message || "Failed to load dashboard data",
      );
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `/api/admin/users/${userId}/role`,
        { role: newRole },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast.success("User role updated");
      fetchAllData();
    } catch (error) {
      toast.error("Failed to update role");
    }
  };

  const handleSuspendUser = async (userId, suspend, reason = "") => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `/api/admin/users/${userId}/suspend`,
        { suspend, reason },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast.success(
        `User ${suspend ? "suspended" : "unsuspended"} successfully`,
      );
      fetchAllData();
    } catch (error) {
      toast.error("Action failed");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone.",
      )
    ) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`/api/admin/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("User deleted successfully");
        fetchAllData();
      } catch (error) {
        toast.error("Failed to delete user");
      }
    }
  };

  const handleApproveProperty = async (propertyId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `/api/admin/properties/${propertyId}/approve`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast.success("Property approved successfully");
      fetchAllData();
    } catch (error) {
      toast.error("Failed to approve property");
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    if (window.confirm("Are you sure you want to delete this property?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`/api/admin/properties/${propertyId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Property deleted successfully");
        fetchAllData();
      } catch (error) {
        toast.error("Failed to delete property");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center bg-red-50 p-8 rounded-lg">
          <div className="text-red-600 text-xl mb-2">
            Error Loading Dashboard
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchAllData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-600 text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-blue-100 mt-2">Welcome back, {user?.name}</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex space-x-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-4 py-3 font-medium transition whitespace-nowrap ${
                activeTab === "dashboard"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`px-4 py-3 font-medium transition whitespace-nowrap ${
                activeTab === "users"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              👥 Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab("properties")}
              className={`px-4 py-3 font-medium transition whitespace-nowrap ${
                activeTab === "properties"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              🏠 Properties ({properties.length})
            </button>
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-4 py-3 font-medium transition whitespace-nowrap ${
                activeTab === "pending"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              ⏳ Pending ({pendingProperties.length})
            </button>
            <button
              onClick={() => setActiveTab("bookings")}
              className={`px-4 py-3 font-medium transition whitespace-nowrap ${
                activeTab === "bookings"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              📅 Bookings ({bookings.length})
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-gray-500 text-sm mb-2">Total Users</div>
                <div className="text-3xl font-bold text-blue-600">
                  {stats.users?.total || 0}
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  👤 {stats.users?.landlords || 0} Landlords | 👥{" "}
                  {stats.users?.tenants || 0} Tenants
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-gray-500 text-sm mb-2">
                  Total Properties
                </div>
                <div className="text-3xl font-bold text-green-600">
                  {stats.properties?.total || 0}
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  🏠 Available: {stats.properties?.available || 0}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-gray-500 text-sm mb-2">Total Bookings</div>
                <div className="text-3xl font-bold text-purple-600">
                  {stats.bookings?.total || 0}
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  ⏳ {stats.bookings?.pending || 0} Pending | ✅{" "}
                  {stats.bookings?.completed || 0} Completed
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-gray-500 text-sm mb-2">Total Revenue</div>
                <div className="text-3xl font-bold text-yellow-600">
                  ₹{(stats.revenue || 0).toLocaleString()}
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  💰 Platform earnings
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <button
                  onClick={() => setActiveTab("users")}
                  className="bg-blue-600 text-white text-center px-4 py-3 rounded-lg hover:bg-blue-700 transition"
                >
                  Manage Users
                </button>
                <button
                  onClick={() => setActiveTab("pending")}
                  className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition"
                >
                  Approve Properties ({pendingProperties.length})
                </button>
                <button
                  onClick={fetchAllData}
                  className="bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition"
                >
                  Refresh Data
                </button>
                <Link
                  to="/admin/properties"
                  className="bg-orange-600 text-white text-center px-4 py-3 rounded-lg hover:bg-orange-700 transition"
                >
                  Moderate Properties
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Users Management Tab */}
        {activeTab === "users" && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <h2 className="text-lg font-semibold">
                All Users ({users.length})
              </h2>
            </div>
            {users.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No users found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((userItem) => (
                      <tr key={userItem._id}>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 font-semibold">
                                {userItem.name?.charAt(0)}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {userItem.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {userItem.phone}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {userItem.email}
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={userItem.role}
                            onChange={(e) =>
                              handleRoleChange(userItem._id, e.target.value)
                            }
                            className="text-sm border rounded px-2 py-1"
                            disabled={userItem.role === "admin"}
                          >
                            <option value="tenant">Tenant</option>
                            <option value="landlord">Landlord</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          {userItem.isSuspended ? (
                            <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                              Suspended
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            {!userItem.isSuspended ? (
                              <button
                                onClick={() =>
                                  handleSuspendUser(userItem._id, true)
                                }
                                className="text-yellow-600 hover:text-yellow-900 text-sm"
                              >
                                Suspend
                              </button>
                            ) : (
                              <button
                                onClick={() =>
                                  handleSuspendUser(userItem._id, false)
                                }
                                className="text-green-600 hover:text-green-900 text-sm"
                              >
                                Unsuspend
                              </button>
                            )}
                            {userItem.role !== "admin" && (
                              <button
                                onClick={() => handleDeleteUser(userItem._id)}
                                className="text-red-600 hover:text-red-900 text-sm"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Properties Tab - Simplified for now */}
        {activeTab === "properties" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">
              All Properties ({properties.length})
            </h2>
            {properties.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No properties found
              </p>
            ) : (
              <div className="space-y-4">
                {properties.slice(0, 5).map((property) => (
                  <div
                    key={property._id}
                    className="border rounded-lg p-4 flex justify-between items-center"
                  >
                    <div>
                      <h3 className="font-semibold">{property.title}</h3>
                      <p className="text-sm text-gray-600">
                        {property.location}
                      </p>
                      <p className="text-sm text-gray-500">
                        ETB {property.price}/month
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteProperty(property._id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                ))}
                {properties.length > 5 && (
                  <p className="text-center text-gray-500">
                    And {properties.length - 5} more...
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Pending Properties Tab */}
        {activeTab === "pending" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">
              Pending Approvals ({pendingProperties.length})
            </h2>
            {pendingProperties.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No pending properties to approve
              </p>
            ) : (
              <div className="space-y-4">
                {pendingProperties.map((property) => (
                  <div key={property._id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{property.title}</h3>
                        <p className="text-sm text-gray-600">
                          {property.location}
                        </p>
                        <p className="text-sm text-gray-500">
                          ETB {property.price}/month
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Landlord: {property.landlord?.name}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproveProperty(property._id)}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleDeleteProperty(property._id)}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === "bookings" && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <h2 className="text-lg font-semibold">
                All Bookings ({bookings.length})
              </h2>
            </div>
            {bookings.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No bookings found
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Property
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Tenant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bookings.map((booking) => (
                      <tr key={booking._id}>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {booking.property?.title || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {booking.tenant?.name || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          ₹{booking.totalAmount}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              booking.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : booking.status === "approved"
                                  ? "bg-blue-100 text-blue-800"
                                  : booking.status === "completed"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {booking.status?.toUpperCase() || "PENDING"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
