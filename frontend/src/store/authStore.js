import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      userRole: null,
      username: null,
      login: (role, token, username) => {
        if (token) {
          localStorage.setItem("token", token);
        }
        set({ 
          isAuthenticated: true, 
          userRole: role,
          username: username || null
        });
      },
      logout: async () => {
        const userRole = get().userRole;
        const token = localStorage.getItem("token");
        
        // Call backend logout if token exists
        if (token) {
          try {
            const { api } = await import("../utils/api");
            if (userRole === "main" || userRole === "sub") {
              await api.post("/admin/logout");
            } else if (userRole === "member") {
              await api.post("/member/logout");
            }
          } catch (error) {
            console.error("Logout error:", error);
            // Continue with logout even if API call fails
          }
        }
        
        // Remove token from localStorage
        localStorage.removeItem("token");
        
        // Determine redirect path
        let redirectPath = "/login";
        if (userRole === "main") {
          redirectPath = "/admin/login";
        } else if (userRole === "sub") {
          redirectPath = "/subadmin/login";
        }
        
        set({ isAuthenticated: false, userRole: null, username: null });
        window.location.href = redirectPath;
      },
      setUserRole: (role) => {
        set({ userRole: role });
      },
      checkAuth: () => {
        const token = localStorage.getItem("token");
        if (token) {
          const state = get();
          if (state.isAuthenticated && state.userRole) {
            return true;
          }
        }
        return false;
      },
    }),
    {
      name: "auth-storage", // unique name for the storage
    },
  ),
);

export default useAuthStore;
