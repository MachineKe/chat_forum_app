import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import Register from "@pages/Register";
import Login from "@pages/Login";
import Forum from "@pages/Forum";
import PostDetail from "@pages/PostDetail";
import Profile from "@pages/Profile";
import PublicProfile from "@pages/PublicProfile";
import AudioRecorderDemo from "@pages/AudioRecorderDemo";
import Chat from "@pages/Chat";
import Sidebar from "@components/layout/Sidebar";
import { useAuth } from "@hooks/useAuth.jsx";
import LoggedOutFooter from "@components/layout/LoggedOutFooter.jsx";

// Layout with persistent Sidebar
function SidebarLayout() {
  const { user } = useAuth ? useAuth() : { user: null };
  const location = useLocation();
  const isProfileIncomplete =
    user &&
    (
      !user.full_name ||
      user.full_name.trim() === "" ||
      !user.bio ||
      user.bio.trim() === ""
    );
  const isOnProfile = location.pathname === "/profile";
  // Hide sidebar if on /profile and profile is incomplete
  if (isProfileIncomplete && isOnProfile) {
    return (
      <div>
        <Outlet />
      </div>
    );
  }
  return (
    <Sidebar>
      <Outlet />
    </Sidebar>
  );
}

// RequireAuth wrapper for protected routes
function RequireAuth({ children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// All routing and footer logic, must be rendered inside <Router>
function AppRoutes() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const hideFooterRoutes = ["/login", "/register"];
  const shouldShowFooter = !user && !hideFooterRoutes.includes(location.pathname);

  // Wait for user profile to load before running redirect logic
  if (loading) {
    return null; // or a spinner if you have one
  }

  // DEBUG: Log user object and completeness check before redirect logic
  if (user) {
    // eslint-disable-next-line
    console.log("DEBUG AppRoutes user object:", user);
    // eslint-disable-next-line
    console.log("DEBUG AppRoutes full_name:", user.full_name, "bio:", user.bio);
    // eslint-disable-next-line
    console.log(
      "DEBUG AppRoutes isProfileIncomplete:",
      !user.full_name ||
        user.full_name.trim() === "" ||
        !user.bio ||
        user.bio.trim() === ""
    );
  }

  // Redirect to /profile if user is logged in and profile is incomplete, except when already on /profile, /login, or /register
  // Only check completeness if both full_name and bio are present as properties
  const hasProfileFields =
    user &&
    Object.prototype.hasOwnProperty.call(user, "full_name") &&
    Object.prototype.hasOwnProperty.call(user, "bio");

  const isProfileIncomplete =
    hasProfileFields &&
    (
      !user.full_name ||
      user.full_name.trim() === "" ||
      !user.bio ||
      user.bio.trim() === ""
    );
  const isOnProfileOrAuth =
    ["/profile", "/login", "/register"].includes(location.pathname);

  if (user && hasProfileFields && isProfileIncomplete && !isOnProfileOrAuth) {
    return <Navigate to="/profile" replace />;
  }

  return (
    <>
      <Routes>
        <Route
          path="/register"
          element={
            user ? <Navigate to="/" replace /> : <Register />
          }
        />
        <Route
          path="/login"
          element={
            user ? <Navigate to="/" replace /> : <Login />
          }
        />
        {/* All main pages use the Sidebar layout */}
        <Route element={<SidebarLayout />}>
          <Route path="/" element={<Forum />} />
          <Route path="/post/:id" element={<PostDetail />} />
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <Profile />
              </RequireAuth>
            }
          />
          <Route path="/user/:username" element={<PublicProfile />} />
          <Route path="/recorder" element={<AudioRecorderDemo />} />
          <Route
            path="/chat"
            element={
              <RequireAuth>
                <Chat />
              </RequireAuth>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      {shouldShowFooter && <LoggedOutFooter />}
    </>
  );
}

// App only renders <Router><AppRoutes /></Router>
function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
