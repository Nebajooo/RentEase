import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const PropertyDetail = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await axios.get(`/api/properties/${id}`);
        setProperty(res.data.property);
      } catch (error) {
        console.error("Error:", error);
        toast.error("Failed to load property");
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  const handleBooking = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "tenant") {
      toast.error("Only tenants can book properties");
      return;
    }

    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      await axios.post(
        "/api/bookings",
        {
          propertyId: id,
          startDate,
          endDate,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );

      toast.success("Booking request sent!");
      navigate("/tenant");
    } catch (error) {
      toast.error(error.response?.data?.message || "Booking failed");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Property not found</p>
        <Link
          to="/properties"
          className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg"
        >
          Browse Properties
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <img
            src={property.images?.[0] || "https://via.placeholder.com/800x500"}
            alt={property.title}
            className="w-full h-96 object-cover rounded-lg"
          />
          <h1 className="text-3xl font-bold mt-6 mb-4">{property.title}</h1>
          <p className="text-gray-600 mb-4">{property.location}</p>
          <div className="flex gap-4 mb-6">
            <div className="bg-gray-100 px-4 py-2 rounded-lg">
              <strong>{property.bedrooms}</strong> Beds
            </div>
            <div className="bg-gray-100 px-4 py-2 rounded-lg">
              <strong>{property.bathrooms}</strong> Baths
            </div>
            <div className="bg-gray-100 px-4 py-2 rounded-lg">
              <strong>{property.propertyType || "Apartment"}</strong>
            </div>
          </div>
          <h2 className="text-2xl font-semibold mb-3">Description</h2>
          <p className="text-gray-700 mb-6">{property.description}</p>

          <h2 className="text-2xl font-semibold mb-3">Amenities</h2>
          <div className="flex flex-wrap gap-2 mb-6">
            {property.amenities?.map((amenity, i) => (
              <span
                key={i}
                className="bg-gray-100 px-3 py-1 rounded-full text-sm"
              >
                {amenity}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 h-fit sticky top-24">
          <div className="text-center mb-4">
            <span className="text-3xl font-bold text-blue-600">
              ETB {property.price}
            </span>
            <span className="text-gray-500">/month</span>
          </div>

          <div className="space-y-2 mb-6">
            <div className="flex justify-between">
              <span>Security Deposit</span>
              <span>ETB {property.price}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Total First Payment</span>
              <span className="text-blue-600">ETB {property.price * 2}</span>
            </div>
          </div>

          <button
            onClick={handleBooking}
            disabled={!property.isAvailable}
            className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {property.isAvailable ? "Request to Book" : "Not Available"}
          </button>

          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 text-center">
              <strong>Hosted by:</strong> {property.landlord?.name}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
