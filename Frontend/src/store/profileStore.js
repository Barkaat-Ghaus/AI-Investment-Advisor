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
        const errorData = await res.json();
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
      const data = await res.json();
      if (res.ok) {
        const profileData = data.profile || data;
        set({ profile: profileData, error: null });
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
