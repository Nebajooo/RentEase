import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const Home = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await axios.get("/api/properties/featured");
        setProperties(res.data.properties || []);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Find Your Perfect Home
          </h1>
          <p className="text-xl mb-8">
            Discover thousands of rental properties across India
          </p>
          <Link
            to="/properties"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100"
          >
            Browse Properties
          </Link>
        </div>
      </div>

      {/* Featured Properties */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Featured Properties
        </h2>
        {loading ? (
          <div className="text-center">Loading...</div>
        ) : properties.length === 0 ? (
          <div className="text-center">
            <p>
              No properties yet. Click the button below to seed sample data.
            </p>
            <button
              onClick={async () => {
                await axios.post("/api/seed");
                window.location.reload();
              }}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg"
            >
              Seed Sample Data
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {properties.map((property) => (
              <div
                key={property._id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <img
                  src={
                    property.images?.[0] ||
                    "https://via.placeholder.com/400x300"
                  }
                  alt={property.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2">
                    {property.title}
                  </h3>
                  <p className="text-gray-600 mb-2">{property.location}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-blue-600">
                      ETB {property.price}
                    </span>
                    <span className="text-gray-500">/month</span>
                  </div>
                  <Link
                    to={`/property/${property._id}`}
                    className="block text-center bg-blue-600 text-white py-2 rounded-lg mt-4 hover:bg-blue-700"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
