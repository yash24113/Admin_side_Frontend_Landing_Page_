import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // Initialize user from localStorage on app start
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  // Check session validity on app start and periodically
  useEffect(() => {
    const checkSession = async () => {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          // Check if user session is still valid
          if (userData.isVerified && userData.email) {
            try {
              const response = await axios.get(
                `http://localhost:5000/api/auth/check-session?email=${userData.email}`
              );
              if (response.data.valid) {
                setUser(response.data.user);
              } else {
                // Session expired, clear user
                setUser(null);
                localStorage.removeItem("user");
              }
            } catch (error) {
              // Session check failed, clear user
              setUser(null);
              localStorage.removeItem("user");
            }
          } else {
            // User not verified, clear user
            setUser(null);
            localStorage.removeItem("user");
          }
        } catch (error) {
          // Invalid data in localStorage, clear it
          setUser(null);
          localStorage.removeItem("user");
        }
      }
      setLoading(false);
    };

    checkSession();

    // Set up periodic session checking (every 5 minutes)
    const sessionCheckInterval = setInterval(checkSession, 5 * 60 * 1000);

    return () => clearInterval(sessionCheckInterval);
  }, []);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      if (user?.email) {
        await axios.post("http://localhost:5000/api/auth/logout", {
          email: user.email,
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      localStorage.removeItem("user");
    }
  };

  const value = {
    user,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
