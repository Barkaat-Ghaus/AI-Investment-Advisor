// Validate and get API base URL
const getAPIBaseURL = () => {
  const url = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  try {
    new URL(url);
    return url;
  } catch {
    console.error('Invalid API_URL provided:', url);
    return 'http://localhost:3001';
  }
};

const API_BASE_URL = getAPIBaseURL();

export default API_BASE_URL;
