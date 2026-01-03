import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { isAuthenticated, hasAccess, validateAuthData } from "./utils/authUtils";

const ProtectedRoute = ({ children, requiredAccess }) => {
  const { user } = useAuth();
  
  const isValidAuth = validateAuthData();
  
  const isUserAuthenticated = user || (isValidAuth && isAuthenticated());
  
  if (!isUserAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  if (requiredAccess) {
    const userHasRequiredAccess = user 
      ? (Array.isArray(requiredAccess)
          ? requiredAccess.some((access) => user?.access?.includes(access))
          : user?.access?.includes(requiredAccess))
      : hasAccess(requiredAccess);

    if (!userHasRequiredAccess) {
      return <Navigate to="/" replace />;
    }
  }
  
  return children;
};

export default ProtectedRoute;