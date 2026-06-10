import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const MyProperties = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageTimestamp, setImageTimestamp] = useState(Date.now());

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/landlord/properties",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setProperties(response.data.properties || []);
      setImageTimestamp(Date.now());
    } catch (error) {
      console.error("Error fetching properties:", error);
      toast.error("Failed to load properties");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this property? This cannot be undone.",
      )
    ) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(
          `http://localhost:5000/api/landlord/properties/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        toast.success("Property deleted successfully");
        await fetchProperties();
      } catch (error) {
        toast.error("Failed to delete property");
      }
    }
  };

  const handleToggleAvailability = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `http://localhost:5000/api/landlord/properties/${id}/toggle-availability`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast.success(response.data.message);
      await fetchProperties();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return `https://via.placeholder.com/300x200?text=No+Image&t=${Date.now()}`;
    }

    if (imagePath.startsWith("http")) {
      return `${imagePath}?t=${imageTimestamp}`;
    }

    if (imagePath.startsWith("/uploads/")) {
      return `http://localhost:5000${imagePath}?t=${imageTimestamp}`;
    }

    return `https://via.placeholder.com/300x200?text=Invalid+Path&t=${Date.now()}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/landlord")}
            className="text-gray-600 hover:text-gray-800 mr-4"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold">My Properties</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchProperties}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            🔄 Refresh
          </button>
          <Link
            to="/landlord/add-property"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Add New
          </Link>
        </div>
      </div>

      {properties.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-500">You haven't listed any properties yet</p>
          <Link
            to="/landlord/add-property"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg mt-4"
          >
            List Your First Property
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {properties.map((property) => (
            <div
              key={property._id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="flex flex-col md:flex-row">
                <div className="relative w-full md:w-64 h-48 bg-gray-100">
                  <img
                    src={getImageUrl(property.images?.[0])}
                    alt={property.title}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.src = `https://via.placeholder.com/300x200?text=Error&t=${Date.now()}`;
                    }}
                  />
                  {property.images && property.images.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                      +{property.images.length - 1} more
                    </div>
                  )}
                </div>
                <div className="flex-1 p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold">
                        {property.title}
                      </h3>
                      <p className="text-gray-600">{property.location}</p>
                      <div className="flex gap-4 text-sm text-gray-500 mt-2">
                        <span>{property.bedrooms} beds</span>
                        <span>{property.bathrooms} baths</span>
                        <span className="capitalize">
                          {property.propertyType}
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-blue-600 mt-2">
                        ₹{property.price}/month
                      </div>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-sm ${property.isAvailable ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                    >
                      {property.isAvailable ? "Available" : "Rented"}
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() =>
                        navigate(`/landlord/edit-property/${property._id}`)
                      }
                      className="bg-yellow-500 text-white px-4 py-2 rounded-lg"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleAvailability(property._id)}
                      className={`px-4 py-2 rounded-lg text-white ${property.isAvailable ? "bg-red-600" : "bg-green-600"}`}
                    >
                      {property.isAvailable ? "Mark Rented" : "Mark Available"}
                    </button>
                    <button
                      onClick={() => handleDelete(property._id)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyProperties;
