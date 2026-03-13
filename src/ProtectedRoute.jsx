import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { isAuthenticated, hasAccess, validateAuthData, getAuthData } from "./utils/authUtils";

const ProtectedRoute = ({ children, requiredAccess }) => {
  const { user } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    const checkAuth = async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      const authData = getAuthData();
      if (authData && authData.user && authData.token) {
        setIsChecking(false);
      } else if (!localStorage.getItem('user') && !localStorage.getItem('token')) {
        setIsChecking(false);
      } else {
        await new Promise(resolve => setTimeout(resolve, 150));
        setIsChecking(false);
      }
    };
    
    checkAuth();
    const timeout = setTimeout(() => setIsChecking(false), 500);
    return () => clearTimeout(timeout);
  }, []);
  
  if (isChecking) {
    return null;
  }
  
  const isValidAuth = validateAuthData();
  const authData = getAuthData();
  const isUserAuthenticated = user || (authData && authData.user && authData.token) || (isValidAuth && isAuthenticated());
  
  if (!isUserAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  if (requiredAccess) {
    const effectiveUser = user || authData?.user;
    const userHasRequiredAccess = effectiveUser
      ? (Array.isArray(requiredAccess)
          ? requiredAccess.some((access) => effectiveUser?.access?.includes(access))
          : effectiveUser?.access?.includes(requiredAccess))
      : hasAccess(requiredAccess);

    if (!userHasRequiredAccess) {
      return <Navigate to="/" replace />;
    }
  }
  
  return children;
};

export default ProtectedRoute;
