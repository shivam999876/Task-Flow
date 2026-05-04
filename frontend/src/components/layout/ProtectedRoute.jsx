import { Navigate, useLocation } from 'react-router-dom';
import useStore from '../../store/useStore';

/**
 * Wraps protected routes — redirects to /login if not authenticated.
 * Preserves the intended destination URL for post-login redirect.
 */
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useStore((s) => s.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
