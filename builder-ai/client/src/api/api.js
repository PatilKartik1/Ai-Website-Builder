import axios from "axios";

// Production API requests use the Vercel origin. The Vercel rewrite forwards
// /api/* to Render, avoiding cross-site session-cookie restrictions.
// Local development can use VITE_BASE_URL to target the local backend.
const baseURL = import.meta.env.PROD
    ? ""
    : (import.meta.env.VITE_BASE_URL || "");

const api = axios.create({
    baseURL,
    withCredentials: true,
});

export default api;
