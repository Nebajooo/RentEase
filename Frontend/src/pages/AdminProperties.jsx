import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const AdminProperties = () => {
  const [pendingProperties, setPendingProperties] = useState([]);
  const [allProperties, setAllProperties] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pendingRes, allRes] = await Promise.all([
        axios.get("/api/admin/pending-properties"),
        axios.get("/api/admin/properties"),
      ]);
      setPendingProperties(pendingRes.data.properties);
      setAllProperties(allRes.data.properties);
    } catch (error) {
      toast.error("Failed to load properties");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.put(`/api/admin/properties/${id}/approve`);
      toast.success("Property approved successfully");
      fetchData();
    } catch (error) {
      toast.error("Failed to approve property");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this property?")) {
      try {
        await axios.delete(`/api/admin/properties/${id}`);
        toast.success("Property deleted successfully");
        fetchData();
      } catch (error) {
        toast.error("Failed to delete property");
      }
    }
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
      <h1 className="text-3xl font-bold mb-6">Property Moderation</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-4 py-2 font-medium transition ${
            activeTab === "pending"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600"
          }`}
        >
          Pending Approval ({pendingProperties.length})
        </button>
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 font-medium transition ${
            activeTab === "all"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600"
          }`}
        >
          All Properties ({allProperties.length})
        </button>
      </div>

      {/* Pending Properties */}
      {activeTab === "pending" &&
        (pendingProperties.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-500 text-lg">
              No pending properties for approval
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingProperties.map((property) => (
              <div
                key={property._id}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <div className="flex flex-col md:flex-row justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-semibold mb-2">
                          {property.title}
                        </h3>
                        <p className="text-gray-600 mb-2">
                          {property.location}
                        </p>
                        <div className="flex gap-4 text-sm text-gray-500 mb-3">
                          <span>{property.bedrooms} beds</span>
                          <span>{property.bathrooms} baths</span>
                          <span>{property.propertyType}</span>
                        </div>
                        <div className="text-2xl font-bold text-blue-600 mb-2">
                          ETB {property.price}/month
                        </div>
                        <div className="text-sm text-gray-600 mt-2">
                          <strong>Landlord:</strong> {property.landlord?.name} (
                          {property.landlord?.email})
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(property._id)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleDelete(property._id)}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-700 mt-3">{property.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}

      {/* All Properties */}
      {activeTab === "all" && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Landlord
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
                {allProperties.map((property) => (
                  <tr key={property._id}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {property.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {property.bedrooms} beds • {property.bathrooms} baths
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {property.location}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      ETB {property.price}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {property.landlord?.name}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          property.isApproved
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {property.isApproved ? "Approved" : "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDelete(property._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProperties;
