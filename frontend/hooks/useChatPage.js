import { useState, useEffect, useRef } from "react";
import { useSocket } from "./useSocket";

/**
 * Fetch all users from the backend.
 * @returns {Promise<Array>} Array of user objects.
 */
async function fetchUsers() {
  const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users`);
  if (!res.ok) throw new Error("Failed to fetch users");
  return await res.json();
}

// Helper: get user by id
const getUserById = (users, id) => users.find((u) => String(u.id) === String(id));

// API base
const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/messages`;

/**
 * Fetch messages for a conversation between two users.
 * @param {string|number} loggedInId
 * @param {string|number} otherUserId
 */
async function fetchMessages(loggedInId, otherUserId) {
  const res = await fetch(`${API_URL}?sender_id=${loggedInId}&receiver_id=${otherUserId}`);
  if (!res.ok) throw new Error("Failed to fetch messages");
  return await res.json();
}

// Create a new message
async function createMessage(data) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to send message");
  return await res.json();
}

// Update a message
async function updateMessage(id, data) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update message");
  return await res.json();
}

// Delete a message
async function deleteMessage(id) {
  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete message");
  return await res.json();
}

export default function useChatPage(loggedInUser) {
  const [users, setUsers] = useState([]);
  // For chat list with latest message preview
  const [chatListUsers, setChatListUsers] = useState([]);
  // Connect to socket server for real-time updates
  const socket = useSocket(import.meta.env.VITE_SOCKET_URL);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [search, setSearch] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch users on mount
  useEffect(() => {
    let ignore = false;
    fetchUsers()
      .then((users) => {
        if (!ignore) {
          setUsers(users.filter(u => !loggedInUser || String(u.id) !== String(loggedInUser.id)));
          // Set default selected user if not set
          if (!selectedUserId && users.length > 0) {
            setSelectedUserId(users[0].id);
          }
        }
      })
      .catch(() => {
        if (!ignore) setUsers([]);
      });
    return () => { ignore = true; };
  }, [loggedInUser]);

  // Fetch chat list users with latest message preview
  useEffect(() => {
    if (!loggedInUser?.id) return;
    let ignore = false;
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/messages/latest-per-user?user_id=${loggedInUser.id}`)
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (!ignore) setChatListUsers(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!ignore) setChatListUsers([]);
      });
    return () => { ignore = true; };
  }, [loggedInUser, messages]);

  // Listen for real-time user list and chat list updates
  useEffect(() => {
    if (!socket) return;
    const handleUserListUpdate = (updatedUsers) => {
      setUsers(updatedUsers.filter(u => !loggedInUser || String(u.id) !== String(loggedInUser.id)));
    };
    socket.on("userListUpdate", handleUserListUpdate);

    // Listen for real-time message updates for the selected conversation
    const handleMessageUpdate = (payload) => {
      // payload: { sender_id, receiver_id, messages }
      console.log("Received messageUpdate", payload, "selectedUserId", selectedUserId, "loggedInUser", loggedInUser?.id);
      if (
        payload &&
        ((payload.sender_id === loggedInUser?.id && payload.receiver_id === selectedUserId) ||
         (payload.sender_id === selectedUserId && payload.receiver_id === loggedInUser?.id))
      ) {
        setMessages(payload.messages);
      }
    };
    socket.on("messageUpdate", handleMessageUpdate);

    // Listen for real-time chat list updates and refresh chatListUsers
    const handleChatListUpdate = () => {
      if (!loggedInUser?.id) return;
      fetch(`${import.meta.env.VITE_BACKEND_URL}/api/messages/latest-per-user?user_id=${loggedInUser.id}`)
        .then(res => res.ok ? res.json() : [])
        .then(data => {
          setChatListUsers(Array.isArray(data) ? data : []);
        })
        .catch(() => setChatListUsers([]));
    };
    socket.on("chatListUpdate", handleChatListUpdate);

    return () => {
      socket.off("userListUpdate", handleUserListUpdate);
      socket.off("messageUpdate", handleMessageUpdate);
      socket.off("chatListUpdate", handleChatListUpdate);
    };
  }, [socket, loggedInUser, selectedUserId]);

  // Fetch messages when selected user changes
  useEffect(() => {
    if (!selectedUserId || !loggedInUser?.id) return;
    let ignore = false;
    setLoading(true);
    fetchMessages(loggedInUser.id, selectedUserId)
      .then((msgs) => {
        if (!ignore) setMessages(msgs);
      })
      .catch(() => {
        if (!ignore) setMessages([]);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => { ignore = true; };
  }, [selectedUserId, loggedInUser]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Send a message
  // Accepts: { content, media_id, media_type, media_title, media_src, media_path, thumbnail, parent_id }
  const sendMessage = async (
    e,
    {
      content,
      media_id = null,
      media_type = null,
      media_title = null,
      media_src = null,
      media_path = null,
      thumbnail = null,
      parent_id = null,
    } = {}
  ) => {
    if (e && e.preventDefault) e.preventDefault();
    const text = typeof content === "string" ? content : input;
    if (!text.trim() && !media_id && !media_src) return;
    const user = getUserById(users, selectedUserId);
    const newMsg = {
      content: text,
      sender_id: loggedInUser?.id || "0",
      receiver_id: selectedUserId,
      media_id,
      media_type,
      media_title,
      media_src,
      media_path,
      thumbnail,
      parent_id,
    };
    try {
      await createMessage(newMsg);
      setInput("");
    } catch (err) {
      // fallback: add to UI anyway
      setMessages((msgs) => [
        ...msgs,
        {
          ...newMsg,
          id: Date.now(),
          isOwn: true,
          sender: "You",
          time: "now",
        },
      ]);
      setInput("");
    }
  };

  // Update a message
  const handleUpdateMessage = async (id, data) => {
    const updated = await updateMessage(id, data);
    setMessages((msgs) => msgs.map((m) => (m.id === id ? updated : m)));
  };

  // Delete a message
  const handleDeleteMessage = async (id) => {
    await deleteMessage(id);
    setMessages((msgs) => msgs.filter((m) => m.id !== id));
  };

  // Add a user to the users array if not present
  const addUser = (userObj) => {
    setUsers((prev) => {
      if (!prev.some(u => u.id === userObj.id)) {
        return [...prev, userObj];
      }
      return prev;
    });
  };

  return {
    users,
    chatListUsers,
    selectedUserId,
    setSelectedUserId,
    addUser,
    search,
    setSearch,
    messages,
    input,
    setInput,
    sendMessage,
    handleUpdateMessage,
    handleDeleteMessage,
    messagesEndRef,
    loading,
  };
}
