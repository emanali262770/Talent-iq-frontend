import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "https://talent-iq-backend-six.vercel.app/api",
  withCredentials: true, // important for cookies
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;