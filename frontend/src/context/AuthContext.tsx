import { createContext, useContext, useEffect, useState } from "react";
// Use the same axios instance as the dashboard/endpoints
import api from "@/api/http";
import { isAuthenticated } from "@/utils/auth";
// Type definition for context
type AuthContextType = {
  authed: boolean;
  setAuthed: (v: boolean) => void;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};
// Create context
const AuthContext = createContext<AuthContextType>({
  authed: false,
  setAuthed: () => {},
  login: async () => {},
  logout: () => {},
});
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authed, setAuthed] = useState<boolean>(isAuthenticated());
  // :brain: :one: Login
  const login = async (username: string, password: string) => {
    try {
      // Align with backend core JWT endpoints
      const res = await api.post("token/", { username, password });
      localStorage.setItem("access", (res.data as any).access);
      localStorage.setItem("refresh", (res.data as any).refresh);
      setAuthed(true);
    } catch (err: any) {
      console.error("Login failed:", err.response?.data || err.message);
      setAuthed(false);
      throw err;
    }
  };
  // :door: :two: Logout
  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setAuthed(false);
  };
  // :arrows_counterclockwise: :three: Token Refresh Function
  const refreshAccessToken = async () => {
    const refresh = localStorage.getItem("refresh");
    if (!refresh) {
      logout();
      return;
    }
    try {
      // Align with backend core JWT refresh endpoint
      const res = await api.post("token/refresh/", { refresh });
      localStorage.setItem("access", (res.data as any).access);
      setAuthed(true);
    } catch (err: any) {
      console.warn("Token refresh failed:", err.response?.data || err.message);
      logout();
    }
  };
  // :alarm_clock: :four: Periodic token refresh (every 4 minutes)
  useEffect(() => {
    if (authed) {
      const interval = setInterval(() => {
        refreshAccessToken();
      }, 4 * 60 * 1000); // 4 minutes
      return () => clearInterval(interval);
    }
  }, [authed]);
  // :package: :five: React to storage or CV updates across tabs
  useEffect(() => {
    const onStorage = () => setAuthed(isAuthenticated());
    const onCvUpdated = () => setAuthed(isAuthenticated());
    window.addEventListener("storage", onStorage);
    window.addEventListener("vericv:cv-updated", onCvUpdated);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("vericv:cv-updated", onCvUpdated);
    };
  }, []);
  return (
    <AuthContext.Provider value={{ authed, setAuthed, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => useContext(AuthContext);
