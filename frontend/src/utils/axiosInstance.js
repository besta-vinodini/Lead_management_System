import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://lead-management-system-backend-x71s.onrender.com/api"
    : "http://localhost:5000/api");

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // in case you're using cookies
});

// Add token automatically
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // assuming you saved JWT in localStorage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
