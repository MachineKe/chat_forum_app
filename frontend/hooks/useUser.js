import { useState, useEffect } from "react";

/**
 * useUser - Custom hook to fetch and manage user info from localStorage and backend.
 * Returns: { userId, username, firstName, fullName, userAvatar, loading, error }
 */
export default function useUser() {
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [fullName, setFullName] = useState("");
  const [userAvatar, setUserAvatar] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.email) {
      fetch(`/api/auth/user-by-email?email=${encodeURIComponent(user.email)}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.id) {
            setUserId(data.id);
            setUsername(data.username || data.email);
            let avatarUrl = data.avatar || "";
            if (avatarUrl && !avatarUrl.startsWith("http")) {
              avatarUrl = `http://localhost:5050/${avatarUrl.replace(/^\/?/, "")}`;
            }
            setUserAvatar(avatarUrl);
            if (data.full_name) {
              setFullName(data.full_name);
              setFirstName(data.full_name.split(" ")[0]);
            } else if (data.username) {
              setFullName(data.username);
              setFirstName(data.username.split(" ")[0]);
            } else if (data.email) {
              setFullName(data.email);
              setFirstName(data.email.split("@")[0]);
            }
          } else {
            setError("User not found");
          }
          setLoading(false);
        })
        .catch(() => {
          setError("Failed to fetch user");
          setLoading(false);
        });
    } else {
      setError("No user in localStorage");
      setLoading(false);
    }
  }, []);

  return { userId, username, firstName, fullName, userAvatar, loading, error };
}
