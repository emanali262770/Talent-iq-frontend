import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";
import FullPageLoader from "../../../components/FullPageLoader";

const Protected = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <FullPageLoader label="Loading user" />;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default Protected;