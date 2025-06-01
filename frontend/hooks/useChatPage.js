import { useState, useEffect, useRef } from "react";

// Mock users data for sidebar and chat header
const mockUsers = [
  {
    id: "1",
    name: "Kaiya George",
    role: "Project Manager",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    online: true,
    lastActive: "15 mins",
  },
  {
    id: "2",
    name: "Lindsey Curtis",
    role: "Designer",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    online: true,
    lastActive: "30 mins",
  },
  {
    id: "3",
    name: "Zain Geidt",
    role: "Content Writer",
    avatar: "https://randomuser.me/api/portraits/women/65.jpg",
    online: false,
    lastActive: "45 mins",
  },
];

// Mock messages for selected user
const mockMessages = {
  "1": [
    {
      id: 1,
      text: "I want to make an appointment tomorrow from 2:00 to 5:00pm?",
      isOwn: false,
      sender: "Kaiya George",
      time: "15 mins",
    },
  ],
  "2": [
    {
      id: 1,
      text: "I want to make an appointment tomorrow from 2:00 to 5:00pm?",
      isOwn: false,
      sender: "Lindsey Curtis",
      time: "30 mins",
    },
    {
      id: 2,
      text: "If don’t like something, I’ll stay away from it.",
      isOwn: true,
      sender: "You",
      time: "2 hours ago",
    },
  ],
  "3": [],
};

export default function useChatPage() {
  const [users, setUsers] = useState(mockUsers);
  const [selectedUserId, setSelectedUserId] = useState(mockUsers[0].id);
  const [search, setSearch] = useState("");
  const [messages, setMessages] = useState(mockMessages[mockUsers[0].id] || []);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  // Update messages when selected user changes
  useEffect(() => {
    setMessages(mockMessages[selectedUserId] || []);
  }, [selectedUserId]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Send a message
  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const newMsg = {
      id: messages.length + 1,
      text: input,
      isOwn: true,
      sender: "You",
      time: "now",
    };
    setMessages((msgs) => [...msgs, newMsg]);
    setInput("");
    // TODO: Persist/send to server
  };

  return {
    users,
    selectedUserId,
    setSelectedUserId,
    search,
    setSearch,
    messages,
    input,
    setInput,
    sendMessage,
    messagesEndRef,
  };
}
