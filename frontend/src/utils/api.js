import axios from "axios";
import useAuthStore from "../store/authStore";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && error.response?.data?.message === "Token expired") {
      // Token expired, clear it and logout
      localStorage.removeItem("token");
      const logout = useAuthStore.getState().logout;
      logout();
    }
    return Promise.reject(error);
  }
);

// Function to handle navigation
const handleNavigation = (navigate, userRole) => {
  if (userRole === "main" || userRole === "sub") {
    navigate("/admin/login");
  } else {
    navigate("/login");
  }
};

// Function to handle API errors
const handleApiError = (error, navigate) => {
  console.error("API Error:", error);
  const logout = useAuthStore.getState().logout;
  const userRole = useAuthStore.getState().userRole;
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    if (error.response.status === 401) {
      // Only redirect if this is a session expiration error
      if (error.response.data?.code !== "INVALID_CREDENTIALS") {
        logout();
        handleNavigation(navigate, userRole);
        return "Session expired, please log in again.";
      }
      return error.response.data.message || "Invalid credentials";
    }
    return error.response.data.message || "An error occurred";
  } else if (error.request) {
    // The request was made but no response was received
    return "No response from server";
  } else {
    // Something happened in setting up the request that triggered an Error
    return error.message || "An error occurred";
  }
};

export { api, handleApiError };
