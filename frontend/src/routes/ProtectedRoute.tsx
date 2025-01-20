import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  allowedRoles: string[];
  children: JSX.Element;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  console.log("User Data from Local Storage:", user);
  console.log("Allowed Roles:", allowedRoles);

  // If the user is not logged in or has no role, redirect to login
  if (!user || !user.role) {
    console.warn("User role is missing or user not found, redirecting to login...");
    return <Navigate to="/login" />;
  }

  // If the user's role is not allowed, redirect to unauthorized
  if (!allowedRoles.includes(user.role)) {
    console.warn(`User role '${user.role}' is not allowed, redirecting to unauthorized...`);
    return <Navigate to="/unauthorized" />;
  }

  // Render children if role is allowed
  return children;
};

export default ProtectedRoute;
