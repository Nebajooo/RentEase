import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const LandlordDashboard = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProperties: 0,
    availableProperties: 0,
    rentedProperties: 0,
    pendingRequests: 0,
    totalEarnings: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      // Fetch properties
      const propertiesRes = await axios.get(
        "http://localhost:5000/api/landlord/properties",
        { headers },
      );
      const props = propertiesRes.data.properties || [];
      setProperties(props);

      // Fetch booking requests
      const requestsRes = await axios.get(
        "http://localhost:5000/api/bookings/requests",
        { headers },
      );
      const reqs = requestsRes.data.requests || [];
      setRequests(reqs);

      // Calculate stats
      const available = props.filter((p) => p.isAvailable).length;
      const rented = props.filter((p) => !p.isAvailable).length;

      setStats({
        totalProperties: props.length,
        availableProperties: available,
        rentedProperties: rented,
        pendingRequests: reqs.length,
        totalEarnings: 0,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/bookings/${id}/${action}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast.success(`Booking ${action}d successfully`);
      fetchData();
    } catch (error) {
      toast.error("Action failed");
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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-800 to-green-600 text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Landlord Dashboard</h1>
          <p className="text-green-100 mt-2">
            Manage your properties and bookings
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-gray-500 text-sm mb-2">Total Properties</div>
            <div className="text-3xl font-bold text-blue-600">
              {stats.totalProperties}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-gray-500 text-sm mb-2">
              Available Properties
            </div>
            <div className="text-3xl font-bold text-green-600">
              {stats.availableProperties}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-gray-500 text-sm mb-2">Rented Properties</div>
            <div className="text-3xl font-bold text-red-600">
              {stats.rentedProperties}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-gray-500 text-sm mb-2">Pending Requests</div>
            <div className="text-3xl font-bold text-yellow-600">
              {stats.pendingRequests}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link
            to="/landlord/add-property"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition text-center"
          >
            <div className="text-4xl mb-2">➕</div>
            <div className="font-semibold text-lg">Add New Property</div>
            <div className="text-sm text-gray-500">
              List a property for rent
            </div>
          </Link>

          <Link
            to="/landlord/my-properties"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition text-center"
          >
            <div className="text-4xl mb-2">🏠</div>
            <div className="font-semibold text-lg">My Properties</div>
            <div className="text-sm text-gray-500">Manage your listings</div>
          </Link>
        </div>

        {/* Recent Properties */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">My Recent Properties</h2>
            <Link
              to="/landlord/my-properties"
              className="text-blue-600 hover:text-blue-700"
            >
              View All →
            </Link>
          </div>

          {properties.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                You haven't listed any properties yet
              </p>
              <Link
                to="/landlord/add-property"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg mt-4"
              >
                List Your First Property
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {properties.slice(0, 3).map((property) => (
                <div key={property._id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {property.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {property.location}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <span className="text-sm text-gray-500">
                          {property.bedrooms} beds
                        </span>
                        <span className="text-sm text-gray-500">
                          {property.bathrooms} baths
                        </span>
                        <span className="text-sm font-semibold text-blue-600">
                          ETB {property.price}/month
                        </span>
                      </div>
                    </div>
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        property.isAvailable
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {property.isAvailable ? "Available" : "Rented"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Booking Requests */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              Booking Requests ({requests.length})
            </h2>
          </div>

          {requests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No pending booking requests</p>
              <p className="text-sm text-gray-400 mt-2">
                When tenants request to book your properties, they will appear
                here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request._id} className="border rounded-lg p-4">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        {request.property?.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {request.property?.location}
                      </p>
                      <div className="mt-2 text-sm">
                        <p>
                          <strong>Tenant:</strong> {request.tenant?.name}
                        </p>
                        <p>
                          <strong>Email:</strong> {request.tenant?.email}
                        </p>
                        <p>
                          <strong>Dates:</strong>{" "}
                          {new Date(request.startDate).toLocaleDateString()} -{" "}
                          {new Date(request.endDate).toLocaleDateString()}
                        </p>
                        <p>
                          <strong>Total Amount:</strong> ETB{" "}
                          {request.totalAmount}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4 md:mt-0">
                      <button
                        onClick={() => handleAction(request._id, "approve")}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(request._id, "reject")}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
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
      </div>
    </div>
  );
};

export default LandlordDashboard;
