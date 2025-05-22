import React from "react";
import MainLayout from "../layouts/MainLayout";
import ChatBubble from "../components/ChatBubble";
import Input from "../components/Input";
import Button from "../components/Button";
import Sidebar from "../components/Sidebar";

const Chat = () => {
  // Placeholder for chat logic and Socket.IO integration
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white py-4 shadow">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Chat + Forum App</h1>
        </div>
      </header>
      <div className="container mx-auto px-4 py-6 flex flex-row gap-8">
        {/* Left Sidebar */}
        <Sidebar title="EPRA" />
        {/* Chat Content */}
        <main className="flex-1 max-w-xl w-full">
          <h2 className="text-2xl font-bold mb-4">Chat</h2>
          <div className="bg-white rounded-lg shadow p-4 mb-4 h-96 overflow-y-auto">
            {/* Map chat messages here */}
            <ChatBubble message="Hello! This is a sample message." isOwn={false} />
            <ChatBubble message="Hi! This is your own message." isOwn={true} />
          </div>
          <form className="flex space-x-2">
            <Input placeholder="Type your message..." className="flex-1" />
            <Button type="submit">Send</Button>
          </form>
        </main>
      </div>
    </div>
  );
};

export default Chat;
