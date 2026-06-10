import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const TenantDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await axios.get("/api/bookings/my-bookings", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setBookings(res.data.bookings || []);
      } catch (error) {
        console.error("Error:", error);
        toast.error("Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-blue-100 text-blue-800";
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Bookings</h1>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-500 text-lg">No bookings yet</p>
          <Link
            to="/properties"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 mt-4"
          >
            Browse Properties
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">
                    {booking.property?.title}
                  </h3>
                  <p className="text-gray-600 mb-2">
                    {booking.property?.location}
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span>
                      📅 Start:{" "}
                      {new Date(booking.startDate).toLocaleDateString()}
                    </span>
                    <span>
                      📅 End: {new Date(booking.endDate).toLocaleDateString()}
                    </span>
                    <span>💰 Amount: ₹{booking.totalAmount}</span>
                  </div>
                </div>
                <div className="mt-4 md:mt-0">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(booking.status)}`}
                  >
                    {booking.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TenantDashboard;
