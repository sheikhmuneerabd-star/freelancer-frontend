// src/Context/SocketContext.jsx
import { createContext, useEffect, useState, useContext } from "react";
import { io } from "socket.io-client";
import { userDataContext } from "./UserContext";
import { authDataContext } from "./AuthContext";

export const socketDataContext = createContext();

function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const { userData } = useContext(userDataContext);
  const { serverUrl } = useContext(authDataContext);

  useEffect(() => {
    if (userData) {
      const newSocket = io(serverUrl);

      // 🔴 ab userId ke sath role bhi bhej rahe hain
      newSocket.emit("register", {
        userId: userData._id,
        role: userData.role, // "client" ya "freelancer"
      });

      setSocket(newSocket);

      return () => newSocket.disconnect();
    }
  }, [userData]);

  return (
    <socketDataContext.Provider value={{ socket }}>
      {children}
    </socketDataContext.Provider>
  );
}

export default SocketProvider;