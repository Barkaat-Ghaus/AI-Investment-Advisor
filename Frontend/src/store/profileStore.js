import { create } from "zustand";
import API_BASE_URL from '../config/api';

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
        const data = await res.json();
        set({ profile: data, error: null });
      } else if (res.status === 404) {
        set({ profile: null, error: null });
      } else {
        // Safely parse — server might return HTML on cold-start or proxy errors
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const errorData = await res.json();
          set({ profile: null, error: errorData.message });
        } else {
          set({ profile: null, error: `Server error (${res.status}). Please try again.` });
        }
      }
    } catch (err) {
      set({ error: 'Unable to reach the server. Check your connection.', profile: null });
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

      // Safely parse — avoid showing raw HTML from Netlify/Render proxy errors
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const msg = res.status === 404
          ? 'API endpoint not found. The backend may be offline.'
          : `Server returned an unexpected response (${res.status}). Please try again.`;
        set({ error: msg });
        return { success: false, message: msg };
      }

      const data = await res.json();
      if (res.ok) {
        const savedProfile = data.profile || data;
        set({ profile: savedProfile, error: null });
        return { success: true, message: data.message };
      } else {
        set({ error: data.message });
        return { success: false, message: data.message };
      }
    } catch (err) {
      const msg = 'Unable to reach the server. Please check your connection.';
      set({ error: msg });
      return { success: false, message: msg };
    } finally {
      set({ loading: false });
    }
  }
}));

export default useProfileStore;
