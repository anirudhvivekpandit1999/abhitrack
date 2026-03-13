import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "./useLocalStorage";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Snackbar, Alert } from "@mui/material";
import { verifyUser } from "../apis/verifyUser";
import { clearAuthData, getAuthData, storeAuthData, USER_TYPES } from "../utils/authUtils";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser, clearUserStorage] = useLocalStorage("user", null);
  const [token, setToken, clearTokenStorage] = useLocalStorage("token", "");

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastSeverity, setToastSeverity] = useState("success");

  useEffect(() => {
    const initializeAuth = async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      const authData = getAuthData();
      if (authData) {
        if (!user || JSON.stringify(user) !== JSON.stringify(authData.user)) {
          setUser(authData.user);
        }
        if (token !== authData.token) {
          setToken(authData.token);
        }
      }
    };
    
    initializeAuth();
  }, []);

  useEffect(() => {
    const handleStorageChange = async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      const authData = getAuthData();
      if (authData && authData.user && authData.token) {
        const userChanged = !user || JSON.stringify(user) !== JSON.stringify(authData.user);
        const tokenChanged = token !== authData.token;
        
        if (userChanged) {
          setUser(authData.user);
        }
        if (tokenChanged) {
          setToken(authData.token);
        }
      } else if ((user || token) && !authData) {
        const hasLocalStorage = localStorage.getItem('user') || localStorage.getItem('token');
        if (!hasLocalStorage) {
          setUser(null);
          setToken("");
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-storage-change', handleStorageChange);
    
    const interval = setInterval(() => {
      handleStorageChange();
    }, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-storage-change', handleStorageChange);
      clearInterval(interval);
    };
  }, [user, token, setUser, setToken]);

  const clearLocalStorage = () => {
    clearUserStorage();
    clearTokenStorage();
    clearAuthData();
  };

  const loginUser = useMutation({
    mutationFn: verifyUser,
    onSuccess: async (data) => {
      if (data.user) {
        setToastSeverity("success");
        setToastMessage(typeof data.message === "string" ? data.message : "Login successful");
        setToastOpen(true);
        
        const { token, ...userData } = data.user;
        const userType = data.user.access === 'External' ? USER_TYPES.EXTERNAL : USER_TYPES.ADMIN;
        
        const success = storeAuthData(userData, token, userType);
        if (!success) {
          setToastSeverity("error");
          setToastMessage("Failed to store authentication data");
          setToastOpen(true);
          return;
        }
        
        await new Promise(resolve => setTimeout(resolve, 150));
        setToken(token);
        setUser(userData);
        
        queryClient.invalidateQueries({ queryKey: ["todos"] });
        await new Promise(resolve => setTimeout(resolve, 200));
        navigate("/data-file-checks", { replace: true });
      } else {
        setToastSeverity("error");
        setToastMessage("Access denied: Invalid user data.");
        setToastOpen(true);
        clearAuthData();
      }
    },
    onError: (error) => {
      setToastSeverity("error");
      setToastMessage(error.message || "Login failed");
      setToastOpen(true);
      clearAuthData();
    },
  });

  const logout = () => {
    setUser(null);
    setToken("");
    clearLocalStorage();
    setToastSeverity("success");
    setToastMessage("You have been logged out successfully.");
    setToastOpen(true);
    navigate("/", { replace: true });
  };

  const handleToastClose = () => setToastOpen(false);

  const value = useMemo(() => ({ user, loginUser, logout }), [user]);

  return (
    <AuthContext.Provider value={value}>
      {children}
      <Snackbar open={toastOpen} autoHideDuration={6000} onClose={handleToastClose}>
        <Alert onClose={handleToastClose} severity={toastSeverity}>
          {toastMessage}
        </Alert>
      </Snackbar>
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
