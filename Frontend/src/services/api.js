import axios from "axios";

const API = axios.create({ baseURL: "/api" });

// Request interceptor
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// Property Services
export const propertyService = {
  getAll: (params) => API.get("/properties", { params }),
  getFeatured: () => API.get("/properties/featured"),
  getById: (id) => API.get(`/properties/${id}`),
  create: (data) => API.post("/properties", data),
  update: (id, data) => API.put(`/properties/${id}`, data),
  delete: (id) => API.delete(`/properties/${id}`),
  toggleAvailability: (id) =>
    API.patch(`/properties/${id}/toggle-availability`),
  getMyProperties: () => API.get("/properties/landlord/my-properties"),
  saveProperty: (id) => API.post(`/properties/${id}/save`),
  getSavedProperties: () => API.get("/properties/saved/saved-properties"),
};

// Booking Services
export const bookingService = {
  create: (data) => API.post("/bookings", data),
  getMyBookings: () => API.get("/bookings/my-bookings"),
  getRequests: () => API.get("/bookings/requests"),
  getLandlordBookings: () => API.get("/bookings/landlord-bookings"),
  approve: (id) => API.put(`/bookings/${id}/approve`),
  reject: (id, reason) => API.put(`/bookings/${id}/reject`, { reason }),
  cancel: (id, reason) => API.put(`/bookings/${id}/cancel`, { reason }),
  complete: (id) => API.put(`/bookings/${id}/complete`),
  checkAvailability: (data) => API.post("/bookings/check-availability", data),
};

// Review Services
export const reviewService = {
  create: (data) => API.post("/reviews", data),
  getPropertyReviews: (propertyId, params) =>
    API.get(`/reviews/property/${propertyId}`, { params }),
  respond: (id, response) => API.put(`/reviews/${id}/respond`, { response }),
  markHelpful: (id) => API.post(`/reviews/${id}/helpful`),
};

// Payment Services
export const paymentService = {
  createPaymentIntent: (bookingId) =>
    API.post("/payments/create-payment-intent", { bookingId }),
  confirmPayment: (paymentIntentId) =>
    API.post("/payments/confirm-payment", { paymentIntentId }),
  getHistory: () => API.get("/payments/history"),
};

// User Services
export const userService = {
  getProfile: () => API.get("/users/profile"),
  updateProfile: (data) => API.put("/users/profile", data),
  getStats: () => API.get("/users/stats"),
  uploadKYC: (file) => {
    const formData = new FormData();
    formData.append("kyc", file);
    return API.post("/users/upload-kyc", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  changePassword: (data) => API.put("/users/change-password", data),
};

// Admin Services
export const adminService = {
  getStats: () => API.get("/admin/stats"),
  getUsers: (params) => API.get("/admin/users", { params }),
  suspendUser: (id, reason) =>
    API.put(`/admin/users/${id}/suspend`, { reason }),
  unsuspendUser: (id) => API.put(`/admin/users/${id}/unsuspend`),
  verifyKYC: (id, status) =>
    API.put(`/admin/users/${id}/verify-kyc`, { status }),
  getProperties: () => API.get("/admin/properties"),
  approveProperty: (id) => API.put(`/admin/properties/${id}/approve`),
  rejectProperty: (id, reason) =>
    API.put(`/admin/properties/${id}/reject`, { reason }),
  getDisputes: () => API.get("/admin/disputes"),
  resolveDispute: (id, resolution) =>
    API.put(`/admin/disputes/${id}/resolve`, { resolution }),
};

export default API;
