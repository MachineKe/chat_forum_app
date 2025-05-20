import React from "react";

const MainLayout = ({ children }) => (
  <div className="min-h-screen bg-gray-50">
    <header className="bg-blue-600 text-white py-4 shadow">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Chat + Forum App</h1>
        {/* Add navigation or user info here */}
      </div>
    </header>
    <main className="container mx-auto px-4 py-6">{children}</main>
  </div>
);

export default MainLayout;
