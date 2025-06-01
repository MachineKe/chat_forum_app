import { useState, useEffect } from "react";
import { useSocket } from "./useSocket";

/**
 * useContacts - Fetches all users from the backend, excluding the logged-in user.
 * @param {Object} loggedInUser - The currently logged-in user.
 * @returns {Array} users - List of user objects.
 */
export default function useContacts(loggedInUser) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const socket = useSocket(import.meta.env.VITE_SOCKET_URL || "http://localhost:3001");

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    fetch("/api/users")
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (!ignore) {
          setUsers(
            Array.isArray(data)
              ? data.filter(u => !loggedInUser || String(u.id) !== String(loggedInUser.id))
              : []
          );
        }
      })
      .catch(() => {
        if (!ignore) setUsers([]);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => { ignore = true; };
  }, [loggedInUser]);

  // Listen for real-time user list updates
  useEffect(() => {
    if (!socket) return;
    const handleUserListUpdate = (updatedUsers) => {
      setUsers(
        Array.isArray(updatedUsers)
          ? updatedUsers.filter(u => !loggedInUser || String(u.id) !== String(loggedInUser.id))
          : []
      );
    };
    socket.on("userListUpdate", handleUserListUpdate);
    return () => {
      socket.off("userListUpdate", handleUserListUpdate);
    };
  }, [socket, loggedInUser]);

  return { users, loading };
}
