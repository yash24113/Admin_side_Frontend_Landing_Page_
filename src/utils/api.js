import axios from "axios";

// Hardcoded backend API URL
const api = axios.create({
  baseURL: "https://langingpage-production-f27f.up.railway.app",
});

export default api;
