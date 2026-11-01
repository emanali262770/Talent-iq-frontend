import { useContext } from "react";
import { AuthContext } from "../auth.context";
import { login, logout, register } from "../services/auth.api";

export const useAuth = () => {
  const { user, setUser, loading, setLoading } = useContext(AuthContext);

  async function handleRegister({ userName, email, password }) {
    setLoading(true);

    try {
      const data = await register({ userName, email, password });
      if (data?.token) {
        localStorage.setItem("token", data.token);
      }
      if (data?.user) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      return { success: true, data };
    } catch (error) {
      console.error("Register Error:", error);
      const message =
        error.response?.data?.message ||
        error.message ||
        "Registration failed. Please check your details and try again.";
      return { success: false, message, error };
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin({ email, password }) {
    setLoading(true);

    try {
      const data = await login({ email, password });
      if (data?.token) {
        localStorage.setItem("token", data.token);
      }
      if (data?.user) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      return { success: true, data };
    } catch (error) {
      console.error("Login Error:", error);
      const message =
        error.response?.data?.message ||
        error.message ||
        "Invalid email or password. Please try again.";
      return { success: false, message, error };
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    setLoading(true);

    try {
      await logout();
    } catch (error) {
      console.error("Logout Error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      setLoading(false);
    }
  }

  return {
    user,
    setUser,
    loading,
    setLoading,
    handleRegister,
    handleLogin,
    handleLogout,
  };
};
