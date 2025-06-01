import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

// Improved Socket.IO connection logic with state for reactivity
export const useSocket = (url) => {
  const socketRef = useRef();
  const [socket, setSocket] = useState();

  useEffect(() => {
    socketRef.current = io(url, {
      transports: ["websocket", "polling"],
      reconnection: true,
    });

    socketRef.current.on("connect", () => {
      // eslint-disable-next-line
      console.log("[socket] connected", socketRef.current.id);
      setSocket(socketRef.current);
    });
    socketRef.current.on("disconnect", () => {
      // eslint-disable-next-line
      console.log("[socket] disconnected");
    });
    socketRef.current.on("connect_error", (err) => {
      // eslint-disable-next-line
      console.error("[socket] connect_error", err);
    });

    // Set socket immediately in case already connected
    if (socketRef.current.connected) setSocket(socketRef.current);

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [url]);

  return socket;
};
