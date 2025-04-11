import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useSelector } from "react-redux";

type SocketContextType = Socket | null;

const SocketContext = createContext<SocketContextType>(null);
const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_SERVER_URL ;
console.log("socket url",SOCKET_SERVER_URL)

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const currentUser = useSelector((state: any) => state.auth.user);

  useEffect(() => {
    if (currentUser) {
      const newSocket = io(SOCKET_SERVER_URL, {
        withCredentials: true,
      });
      newSocket.on("connect", () => {
        console.log("Socket connected:", newSocket.id);
        if (currentUser?.userData) {
          newSocket.emit("setup", currentUser.userData);
        }
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [currentUser?.userData]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};


export const useSocket = (): Socket | null => {
  const socket = useContext(SocketContext);
  if (socket === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return socket;
};
