import React from "react";
import { Link } from "react-router-dom";
import { FaBed, FaBath, FaRulerCombined, FaHeart } from "react-icons/fa";
import { formatPrice } from "../../utils/helpers";

const PropertyCard = ({ property, onSave, isSaved }) => {
  const [imageError, setImageError] = React.useState(false);

  return (
    <div className="card group hover:scale-105 transition-transform duration-300">
      <Link to={`/property/${property._id}`}>
        <div className="relative h-56 overflow-hidden">
          <img
            src={
              imageError
                ? "/placeholder-house.jpg"
                : property.images?.[0] || "/placeholder-house.jpg"
            }
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
          <div className="absolute top-3 right-3">
            <button
              onClick={(e) => {
                e.preventDefault();
                onSave?.(property._id);
              }}
              className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition"
            >
              <FaHeart
                className={`text-xl ${isSaved ? "text-red-500" : "text-gray-400"}`}
              />
            </button>
          </div>
          {property.isAvailable ? (
            <span className="absolute bottom-3 left-3 bg-green-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
              Available
            </span>
          ) : (
            <span className="absolute bottom-3 left-3 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
              Rented
            </span>
          )}
        </div>

        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-dark hover:text-primary transition">
              {property.title}
            </h3>
          </div>

          <p className="text-gray-600 text-sm mb-2">
            {property.address?.city}, {property.address?.state}
          </p>

          <div className="flex justify-between items-center mb-3">
            <span className="text-2xl font-bold text-primary">
              {formatPrice(property.price)}
            </span>
            <span className="text-gray-500 text-sm">/month</span>
          </div>

          <div className="flex justify-between text-gray-600 text-sm border-t pt-3">
            <div className="flex items-center space-x-1">
              <FaBed className="text-gray-400" />
              <span>{property.bedrooms} beds</span>
            </div>
            <div className="flex items-center space-x-1">
              <FaBath className="text-gray-400" />
              <span>{property.bathrooms} baths</span>
            </div>
            <div className="flex items-center space-x-1">
              <FaRulerCombined className="text-gray-400" />
              <span>{property.sqft} sqft</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default PropertyCard;
