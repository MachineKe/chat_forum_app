import React from "react";
import ChatBubble from "../components/layout/ChatBubble";
import Input from "../components/layout/Input";
import Button from "../components/layout/Button";
import Sidebar from "../components/layout/Sidebar";
import useChatPage from "../hooks/useChatPage";

const Chat = () => {
  const { messages, input, setInput, sendMessage, messagesEndRef } = useChatPage();

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
            {messages.map((msg) => (
              <ChatBubble key={msg.id} message={msg.text} isOwn={msg.isOwn} />
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form className="flex space-x-2" onSubmit={sendMessage}>
            <Input
              placeholder="Type your message..."
              className="flex-1"
              value={input}
              onChange={e => setInput(e.target.value)}
            />
            <Button type="submit">Send</Button>
          </form>
        </main>
      </div>
    </div>
  );
};

export default Chat;
