import React, { createContext, useContext, useState, useCallback } from "react";

const AuthContext = createContext(null);

/**
 * AuthProvider wraps the app and provides authentication state.
 * Stores user/vendor data in localStorage for persistence across refreshes.
 */
export const AuthProvider = ({ children }) => {
  // Initialize state from localStorage (persists across page refreshes)
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [vendor, setVendor] = useState(() => {
    try {
      const stored = localStorage.getItem("vendor");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Login as regular user
  const loginUser = useCallback((userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  }, []);

  // Login as vendor — H-1 FIX: consistent key "vendor" with _id stored
  const loginVendor = useCallback((vendorData) => {
    localStorage.setItem("vendor", JSON.stringify(vendorData));
    // Also store vendorId separately for backward compat with existing components
    localStorage.setItem("vendorId", vendorData._id);
    setVendor(vendorData);
  }, []);

  // Logout both user and vendor
  const logout = useCallback(() => {
    localStorage.removeItem("user");
    localStorage.removeItem("vendor");
    localStorage.removeItem("vendorId");
    setUser(null);
    setVendor(null);
  }, []);

  const isAuthenticated = !!(user || vendor);
  const isVendor = !!vendor;
  const isUser = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        vendor,
        loginUser,
        loginVendor,
        logout,
        isAuthenticated,
        isVendor,
        isUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * useAuth — hook for consuming auth context in any component.
 * Usage: const { user, vendor, loginUser, loginVendor, logout } = useAuth();
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
