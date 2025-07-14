import axios from "axios";

// Hardcoded backend API URL
const api = axios.create({
  baseURL: "https://age-landing-backend.egport.com",
});

export default api;
