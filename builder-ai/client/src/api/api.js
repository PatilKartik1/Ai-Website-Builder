import axios from "axios";

// Production requests use the Vercel origin; vercel.json forwards /api/*
// to Render. This keeps the browser session cookie first-party.
// In local development, VITE_BASE_URL may still target localhost.
const baseURL = import.meta.env.PROD
    ? ""
    : (import.meta.env.VITE_BASE_URL || "");

const api = axios.create({
    baseURL,
    withCredentials: true,
});

export default api;
