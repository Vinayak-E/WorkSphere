import { Server } from "socket.io";
import http from "http";
import mongoose from "mongoose";
import { ChatService } from "../services/employee/chat.service";
import { ChatRepository } from "../repositories/employee/chatRepository";
import { EmployeeRepository } from "../repositories/employee/employeeRepository";
import { connectTenantDB  as getTenantConnection } from "../configs/db.config";


const employeeRepository = new EmployeeRepository()
const chatRepository = new ChatRepository();
const chatService = new ChatService(chatRepository,employeeRepository);

/**
 * Initializes the Socket.io server with robust event handling.
 *
 * @param server - The underlying HTTP server.
 * @returns The Socket.io server instance.
 */
export const initializeSocket = (server: http.Server) => {
  const io = new Server(server, {
    cors: {
      origin: ["http://localhost:5000", "http://localhost:5173"],
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      allowedHeaders: ["Content-Type", "Authorization"],
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

  
    socket.on("join chat", (room: string) => {
      if (room) {
        socket.join(room);
        console.log(`Socket ${socket.id} joined room ${room}`);
      } else {
        console.warn(`Socket ${socket.id} attempted to join an invalid room.`);
      }
    });

    // Event: leave chat room
    socket.on("leave chat", (room: string) => {
      if (room) {
        socket.leave(room);
        console.log(`Socket ${socket.id} left room ${room}`);
      }
    });

    // Event: new message handling for one-on-one or group chat
    socket.on("new message", async (data) => {
   
      try {
        console.log('data',data)
        const { tenantId, content, chat, sender } = data;
        if (!tenantId || !content || !chat || !sender) {
          console.error("Incomplete message data received:", data);
          return;
        }

        // Retrieve the tenant-specific database connection.
        const tenantConnection: mongoose.Connection = await getTenantConnection(tenantId);
        if (!tenantConnection) {
          console.error("Tenant connection not found for tenantId:", tenantId);
          return;
        }

        // Save the message (this call handles both persisting the message and updating the chat's latest message).
        const savedMessage = await chatService.sendMessage(
          tenantConnection,
          content,
          chat._id,    // Ensure that chat._id is in the proper format (string or ObjectId as expected by your service)
          sender.userData._id   // Similarly, sender._id should match expected type
        );
        console.log('savedMessage',savedMessage)
        // Broadcast the saved message based on chat type.
        socket.to(chat._id).emit("message received", {
            ...savedMessage,
            sender: sender.userData  // Include the complete sender info
          });
        console.log(`Message broadcast to room ${chat._id}`);
      } catch (error) {
        console.error("Error handling new message:", error);
        socket.emit("error", { message: "Failed to process your message." });
      }
    });

    // Event: Typing notification (broadcast to everyone else in the room)
    socket.on("typing", (room: string) => {
      if (room) {
        socket.to(room).emit("typing");
      }
    });

    socket.on("stop typing", (room: string) => {
      if (room) {
        socket.to(room).emit("stop typing");
      }
    });

    // Event: disconnect
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
};
