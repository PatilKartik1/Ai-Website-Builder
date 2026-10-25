import axios from "axios";

 fix/same-origin-api-requests
// Production requests use the Vercel origin; vercel.json forwards /api/*
// to Render. This keeps the browser session cookie first-party.
// In local development, VITE_BASE_URL may still target localhost.

// In production, send API requests to the Vercel origin. vercel.json rewrites
// /api/* to the Render backend, keeping the browser session cookie first-party.
// During local development, VITE_BASE_URL can still point directly at localhost.
main
const baseURL = import.meta.env.PROD
    ? ""
    : (import.meta.env.VITE_BASE_URL || "");

const api = axios.create({
    baseURL,
    withCredentials: true,
});

export default api;
