import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";

const Protected = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <p>Loading...</p>; // wait until auth check finishes
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default Protected;