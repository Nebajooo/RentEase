import React, { useState, useEffect } from "react";
import axios from "axios";

const FilterSidebar = ({ filters, onFilterChange, onClear }) => {
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [amenitiesList, setAmenitiesList] = useState([]);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const typesRes = await axios.get("/api/property-types");
        const amenitiesRes = await axios.get("/api/amenities");
        setPropertyTypes(typesRes.data.types || []);
        setAmenitiesList(amenitiesRes.data.amenities || []);
      } catch (error) {
        console.error("Error fetching filter options:", error);
      }
    };
    fetchFilterOptions();
  }, []);

  const handleAmenityToggle = (amenity) => {
    const currentAmenities = filters.amenities || [];
    let newAmenities;
    if (currentAmenities.includes(amenity)) {
      newAmenities = currentAmenities.filter((a) => a !== amenity);
    } else {
      newAmenities = [...currentAmenities, amenity];
    }
    onFilterChange({ amenities: newAmenities });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Filters</h3>
        <button
          onClick={onClear}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          Clear All
        </button>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Price Range
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice || ""}
            onChange={(e) => onFilterChange({ minPrice: e.target.value })}
            className="w-1/2 px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice || ""}
            onChange={(e) => onFilterChange({ maxPrice: e.target.value })}
            className="w-1/2 px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
      </div>

      {/* Bedrooms */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Bedrooms
        </label>
        <select
          value={filters.bedrooms || ""}
          onChange={(e) => onFilterChange({ bedrooms: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="">Any</option>
          <option value="1">1 Bedroom</option>
          <option value="2">2 Bedrooms</option>
          <option value="3">3 Bedrooms</option>
          <option value="4+">4+ Bedrooms</option>
        </select>
      </div>

      {/* Bathrooms */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Bathrooms
        </label>
        <select
          value={filters.bathrooms || ""}
          onChange={(e) => onFilterChange({ bathrooms: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="">Any</option>
          <option value="1">1 Bathroom</option>
          <option value="2">2 Bathrooms</option>
          <option value="3+">3+ Bathrooms</option>
        </select>
      </div>

      {/* Property Type */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Property Type
        </label>
        <select
          value={filters.propertyType || ""}
          onChange={(e) => onFilterChange({ propertyType: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="">All Types</option>
          {propertyTypes.map((type) => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Amenities */}
      {amenitiesList.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amenities
          </label>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {amenitiesList.map((amenity) => (
              <label key={amenity} className="flex items-center">
                <input
                  type="checkbox"
                  checked={(filters.amenities || []).includes(amenity)}
                  onChange={() => handleAmenityToggle(amenity)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-600">{amenity}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Availability */}
      <div className="mb-6">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={filters.isAvailable === "true"}
            onChange={(e) =>
              onFilterChange({ isAvailable: e.target.checked ? "true" : "" })
            }
            className="mr-2"
          />
          <span className="text-sm text-gray-700">
            Show only available properties
          </span>
        </label>
      </div>
    </div>
  );
};

export default FilterSidebar;
