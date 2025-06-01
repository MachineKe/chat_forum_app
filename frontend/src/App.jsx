import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Register from "@pages/Register";
import Login from "@pages/Login";
import Forum from "@pages/Forum";
import PostDetail from "@pages/PostDetail";
import Profile from "@pages/Profile";
import PublicProfile from "@pages/PublicProfile";
import AudioRecorderDemo from "@pages/AudioRecorderDemo";
import Chat from "@pages/Chat";
import Sidebar from "@components/layout/Sidebar";

// Layout with persistent Sidebar
function SidebarLayout() {
  return (
    <Sidebar>
      <Outlet />
    </Sidebar>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        {/* All main pages use the Sidebar layout */}
        <Route element={<SidebarLayout />}>
          <Route path="/" element={<Forum />} />
          <Route path="/post/:id" element={<PostDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/user/:username" element={<PublicProfile />} />
          <Route path="/recorder" element={<AudioRecorderDemo />} />
          <Route path="/recorder" element={<AudioRecorderDemo />} />
          <Route path="/chat" element={<Chat />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
