// Central API base URL configuration
// In production (Netlify), set VITE_API_BASE_URL in the Netlify dashboard → Site Settings → Environment Variables
// In development, falls back to localhost:3001

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://ai-investment-advisor-yhar.onrender.com';

export default API_BASE_URL;
