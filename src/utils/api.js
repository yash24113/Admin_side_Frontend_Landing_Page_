import axios from "axios";

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_API || "http://localhost:5000",
});

export default api;
