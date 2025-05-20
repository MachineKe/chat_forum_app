import React from "react";
import MainLayout from "../layouts/MainLayout";
import ChatBubble from "../components/ChatBubble";
import Input from "../components/Input";
import Button from "../components/Button";

const Chat = () => {
  // Placeholder for chat logic and Socket.IO integration
  return (
    <MainLayout>
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
    </MainLayout>
  );
};

export default Chat;
