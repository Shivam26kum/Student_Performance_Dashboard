import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ children, allowedRoles }) {
  // 1. We MUST pull 'token' and 'role' exactly as they are named in AuthContext.jsx
  const { token, role } = useAuth();

  // 2. If there is no token, the user is not logged in. Kick them to the login screen.
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 3. If the route requires specific roles (e.g., ["teacher"]), check if the user's role is in that list.
  if (allowedRoles && !allowedRoles.includes(role)) {
    // If a teacher tries to type /admin in the URL, send them back to the teacher dashboard!
    return <Navigate to={`/${role}`} replace />; 
  }

  // 4. If they have a token AND the right role, allow them to view the page!
  return children;
}