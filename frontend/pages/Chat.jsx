import React, { useState } from "react";
import ChatList from "../components/chat/ChatList";
import ChatWindow from "../components/chat/ChatWindow";

// Mock data for demonstration
const mockUsers = [
  {
    id: 1,
    name: "Kaiya George",
    role: "Project Manager",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    online: true,
    lastMessageTime: "15 mins",
  },
  {
    id: 2,
    name: "Lindsey Curtis",
    role: "Designer",
    avatar: "https://randomuser.me/api/portraits/women/65.jpg",
    online: true,
    lastMessageTime: "30 mins",
  },
  {
    id: 3,
    name: "Zain Geidt",
    role: "Content Writer",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    online: true,
    lastMessageTime: "45 mins",
  },
  {
    id: 4,
    name: "Carla George",
    role: "Front-end Developer",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    online: false,
    lastMessageTime: "2 days",
  },
];

const mockMessages = {
  2: [
    {
      id: 1,
      text: "I want to make an appointment tomorrow from 2:00 to 5:00pm?",
      isOwn: false,
      time: "30 mins",
      avatar: "https://randomuser.me/api/portraits/women/65.jpg",
    },
    {
      id: 2,
      text: "If don’t like something, I’ll stay away from it.",
      isOwn: true,
      time: "2 hours ago",
      avatar: "",
    },
    {
      id: 3,
      text: "I want more detailed information.",
      isOwn: false,
      time: "2 hours ago",
      avatar: "https://randomuser.me/api/portraits/women/65.jpg",
    },
  ],
  1: [],
  3: [],
  4: [],
};

const Chat = () => {
  const [selectedUserId, setSelectedUserId] = useState(mockUsers[0].id);
  const [messages, setMessages] = useState(mockMessages);

  const handleSelectUser = (userId) => {
    setSelectedUserId(userId);
  };

  const handleSendMessage = (text) => {
    setMessages((prev) => ({
      ...prev,
      [selectedUserId]: [
        ...(prev[selectedUserId] || []),
        {
          id: Date.now(),
          text,
          isOwn: true,
          time: "now",
          avatar: "",
        },
      ],
    }));
  };

  const selectedUser = mockUsers.find((u) => u.id === selectedUserId);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="container mx-auto px-4 flex-1 flex items-center justify-center">
        <div className="flex gap-8">
          <ChatList
            users={mockUsers}
            selectedUserId={selectedUserId}
            onSelectUser={handleSelectUser}
          />
          <ChatWindow
            user={selectedUser}
            messages={messages[selectedUserId] || []}
            onSendMessage={handleSendMessage}
            onAttach={() => {}}
            onRecord={() => {}}
            onVideoCall={() => {}}
          />
        </div>
      </div>
    </div>
  );
};

export default Chat;
