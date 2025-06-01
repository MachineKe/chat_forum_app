import { useState, useEffect, useRef } from "react";

// Placeholder for future Socket.IO or API integration
export default function useChatPage() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! This is a sample message.", isOwn: false },
    { id: 2, text: "Hi! This is your own message.", isOwn: true },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  // Example: Scroll to bottom on new message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Placeholder for sending a message
  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages((msgs) => [
      ...msgs,
      { id: msgs.length + 1, text: input, isOwn: true },
    ]);
    setInput("");
    // TODO: Emit to server via Socket.IO
  };

  // Placeholder for receiving a message (simulate)
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     setMessages((msgs) => [
  //       ...msgs,
  //       { id: msgs.length + 1, text: "This is a received message.", isOwn: false },
  //     ]);
  //   }, 5000);
  //   return () => clearTimeout(timer);
  // }, []);

  return {
    messages,
    input,
    setInput,
    sendMessage,
    messagesEndRef,
  };
}
