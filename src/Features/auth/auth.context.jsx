import { createContext, useEffect, useState } from "react";
import { getCurrentUser } from "./services/auth.api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(() => {
    // If we have a stored user or token, we will verify in the background
    const token = localStorage.getItem("token");
    const stored = localStorage.getItem("user");
    return Boolean(token || stored);
  });

  useEffect(() => {
    const loadCurrentUser = async () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      // If user has never logged in and has no token, don't keep loading state
      if (!token && !storedUser) {
        setLoading(false);
        return;
      }

      try {
        const data = await getCurrentUser();
        if (data && data.user) {
          setUser(data.user);
          localStorage.setItem("user", JSON.stringify(data.user));
        }
      } catch (error) {
        console.error("Get Current User Error:", error);
        // Only clear if server says 401 Unauthorized
        if (error.response?.status === 401) {
          setUser(null);
          localStorage.removeItem("user");
          localStorage.removeItem("token");
        }
      } finally {
        setLoading(false);
      }
    };

    loadCurrentUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, setLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
