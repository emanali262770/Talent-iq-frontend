import { useContext, useEffect } from "react";
import { AuthContext } from "../auth.context";
import { getCurrentUser, login, logout, register } from "../services/auth.api";

export const useAuth = () => {
  const { user, setUser, loading, setLoading } = useContext(AuthContext);

  async function handleRegister({ userName, email, password }) {
    setLoading(true);

    try {
      const data = await register({ userName, email, password });
      setUser(data.user);
    } catch (error) {
      console.error("Register Error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin({ email, password }) {
    setLoading(true);

    try {
      const data = await login({ email, password });
      setUser(data.user);
    } catch (error) {
      console.error("Login Error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    setLoading(true);

    try {
      await logout();
      setUser(null);
    } catch (error) {
      console.error("Logout Error:", error);
    } finally {
      setLoading(false);
    }
  }
  async function handleGetCurrentUser() {
    setLoading(true);

    try {
      const data = await getCurrentUser();
      setUser(data.user);
    } catch (error) {
      console.error("Get Current User Error:", error);
    } finally {
      setLoading(false);
    }
  }
    useEffect(() => {
 
    handleGetCurrentUser();
 
}, []);
  
  return {
    user,
    loading,
    handleRegister,
    handleLogin,
    handleLogout,
  
  };
};
