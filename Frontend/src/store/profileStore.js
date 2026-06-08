import { create } from "zustand";
import API_BASE_URL from '../config/api';

// Safely parse JSON — guards against HTML error pages (e.g. Render cold-start wake-up pages)
const safeJson = async (res) => {
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return res.json();
  }
  // Non-JSON body (HTML error page, plain text, etc.)
  const text = await res.text();
  if (res.status === 503 || res.status === 502) {
    return { message: 'The server is starting up, please try again in a few seconds.' };
  }
  return { message: text.slice(0, 200) || `Server error (${res.status})` };
};

const useProfileStore = create((set, get) => ({
  profile: null,
  loading: false,
  error: null,

  fetchProfile: async (token) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_BASE_URL}/api/profile`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await safeJson(res);
        set({ profile: data, error: null });
      } else if (res.status === 404) {
        set({ profile: null, error: null });
      } else {
        const errorData = await safeJson(res);
        set({ profile: null, error: errorData.message });
      }
    } catch (err) {
      set({ error: err.message, profile: null });
    } finally {
      set({ loading: false });
    }
  },

  saveProfile: async (profileData, token) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_BASE_URL}/api/profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });
      const data = await safeJson(res);
      if (res.ok) {
        const savedProfile = data.profile || data;
        set({ profile: savedProfile, error: null });
        return { success: true, message: data.message };
      } else {
        set({ error: data.message });
        return { success: false, message: data.message };
      }
    } catch (err) {
      set({ error: err.message });
      return { success: false, message: err.message };
    } finally {
      set({ loading: false });
    }
  }
}));

export default useProfileStore;
