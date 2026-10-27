import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated } from "../services/api";

/**
 * ProtectedRoute component for guarding admin routes.
 * Redirects unauthenticated users to /admin and preserves attempt location.
 */
function ProtectedRoute({ children }) {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/admin" state={{ from: location }} replace />;
  }

  return children;
}

export default ProtectedRoute;
