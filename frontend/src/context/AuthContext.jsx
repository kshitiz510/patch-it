import React, { createContext, useContext, useState, useEffect } from "react";
import { api, getStoredAuth, storeAuth, clearAuth } from "../api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(() => getStoredAuth());

  const login = (authData) => {
    storeAuth(authData);
    setAuthState({
      accessToken: authData.accessToken,
      refreshToken: authData.refreshToken,
      user: authData.user,
    });
  };

  const logout = async () => {
    try {
      // Attempt backend logout to invalidate session/refresh token
      await api.post("/auth/logout");
    } catch (err) {
      console.warn("Backend logout failed:", err.message);
    } finally {
      clearAuth();
      setAuthState({
        accessToken: null,
        refreshToken: null,
        user: null,
      });
    }
  };

  const updateUser = (updatedUser) => {
    const newAuthState = {
      ...authState,
      user: updatedUser,
    };
    localStorage.setItem("patchit_user", JSON.stringify(updatedUser));
    setAuthState(newAuthState);
  };

  // Sync token header for Axios calls if it changes
  useEffect(() => {
    if (authState.accessToken) {
      api.defaults.headers.common["Authorization"] = `Bearer ${authState.accessToken}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  }, [authState.accessToken]);

  return (
    <AuthContext.Provider
      value={{
        user: authState.user,
        token: authState.accessToken,
        isAuthenticated: !!authState.accessToken,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
