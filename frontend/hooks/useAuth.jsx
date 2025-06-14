import { useState, useEffect, useContext, createContext } from "react";

// Create AuthContext
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch latest user profile from backend
  const fetchProfile = async (tokenToUse = null) => {
    const t = tokenToUse || token;
    // Get email from localStorage user or current user state
    let email = null;
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed && parsed.email) email = parsed.email;
      }
    } catch {}
    if (!email && user && user.email) email = user.email;
    if (!email) return null;
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/profile?email=${encodeURIComponent(email)}`,
        {
          headers: t ? { Authorization: `Bearer ${t}` } : {},
        }
      );
      if (res.ok) {
        const data = await res.json();
        console.log("DEBUG fetchProfile response:", data); // DEBUG
        setUser(data);
        localStorage.setItem("user", JSON.stringify(data));
        return data;
      }
    } catch {
      // ignore
    }
    return null;
  };

  // Load user/token from localStorage on mount and keep in sync with storage events
  useEffect(() => {
    async function syncAuthFromStorage() {
      setLoading(true);
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      let validUser = null;
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          // Only accept if parsed is an object and not a string like "user"
          if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
            validUser = parsed;
          } else {
            localStorage.removeItem("user");
          }
        } catch {
          localStorage.removeItem("user");
        }
      }
      if (storedToken) {
        setToken(storedToken);
        // Always fetch latest profile from backend if token exists
        await fetchProfile(storedToken);
      } else {
        setToken(null);
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
      setLoading(false);
    }
    syncAuthFromStorage();
    window.addEventListener("storage", syncAuthFromStorage);
    return () => window.removeEventListener("storage", syncAuthFromStorage);
  }, []);

  // Save user/token to localStorage when changed
  useEffect(() => {
    if (token && user) {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }, [token, user]);

  // Login function
  const login = async (email, password) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        setToken(data.token);
        setUser(data.user); // Set user from login response immediately
        // Fetch latest profile from backend and wait for it to complete
        await fetchProfile(data.token);
        return { success: true };
      } else {
        logout();
        return { success: false, error: data.error || "Login failed" };
      }
    } catch (err) {
      logout();
      return { success: false, error: err.message || "Login failed" };
    }
  };

  // Logout function
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  // Register function
  const register = async (username, email, password) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        // Registration does not log in user by default
        return { success: true, message: data.message };
      } else {
        return { success: false, error: data.error || "Registration failed" };
      }
    } catch (err) {
      return { success: false, error: err.message || "Registration failed" };
    }
  };

  // Attach token to fetch requests (utility)
  const authFetch = async (url, options = {}) => {
    const headers = options.headers || {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return fetch(url, { ...options, headers });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        register,
        authFetch,
        setUser,
        setToken,
        fetchProfile,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
