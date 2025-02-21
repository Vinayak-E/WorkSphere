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


export const initializeSocket = (server: http.Server) => {
  const io = new Server(server, {
    cors: {
      origin: ["http://localhost:5000", "http://localhost:5173"],
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      allowedHeaders: ["Content-Type", "Authorization"],
    },
  });
  const onlineUsers = new Map();
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
        const { tenantId, type, content, mediaUrl, chat, sender } = data;
        if (!tenantId || !chat || !sender || (!content && !mediaUrl)) {
          console.error("Incomplete message data received:", data);
          return;
        }
  
       
        const tenantConnection: mongoose.Connection = await getTenantConnection(tenantId);
        if (!tenantConnection) {
          console.error("Tenant connection not found for tenantId:", tenantId);
          return;
        }
        const messageData: any = {
          content: content || "", 
          chatId: chat._id,
          senderId: sender.userData._id,
          type,
          isRead:false
        };
        if ((type === "image"  || type === "video" ) && mediaUrl) {
          messageData.mediaUrl = mediaUrl;
        } 
      
        
        // Save the message (this call handles both persisting the message and updating the chat's latest message).
        const savedMessage = await chatService.sendMessage(
          tenantConnection,
          messageData.content,
          messageData.chatId,
          messageData.senderId,
          messageData.mediaUrl,
          messageData.type
          
        )
        console.log('savedMessage',savedMessage)
        // Broadcast the saved message based on chat type.
        socket.to(chat._id).emit("message received", {
            ...savedMessage,
            sender: sender.userData,
            chat: chat._id  
          });
        console.log(`Message broadcast to room ${chat._id}`);

       
    const chatMembers = await chatService.getChatMembers(tenantConnection, chat._id);
    console.log('Attempting to send notifications to members:', {
      totalMembers: chatMembers.length,
      onlineUsers: Array.from(onlineUsers.entries()),
      sender: sender.userData._id
    });

    chatMembers.forEach(member => {
     
      const memberIdString = member._id.toString();
      const memberSocketId = onlineUsers.get(memberIdString);

      console.log('Processing member notification:', {
        memberId: memberIdString,
        memberSocketId,
        isOnline: !!memberSocketId,
        isSender: memberIdString === sender.userData._id
      });

      if (memberIdString !== sender.userData._id && memberSocketId) {
        console.log('Emitting notification to socket:', memberSocketId);
        io.to(memberSocketId).emit("new_notification", {
          _id: savedMessage._id.toString(),
          sender: {
            ...sender.userData,
            _id: sender.userData._id.toString()
          },
          chat: chat._id.toString(),
          content: savedMessage.content,
          createdAt: savedMessage.createdAt,
         
        });
      }
    });
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

    
    
    socket.on("message read", async (data) => {
      try {
        const { messageId, chatId, readerId, tenantId } = data;
        console.log('data at message read',data)
        
        const tenantConnection = await getTenantConnection(tenantId);
        if (!tenantConnection) {
          console.error("Tenant connection not found for tenantId:", tenantId);
          return;
        }
        
        // Update message read status in database
        await chatService.markMessageAsRead(
          tenantConnection,
          messageId,
          readerId
          );
          
          // Broadcast to all users in the chat that the message was read
          io.to(chatId).emit("message read update", {
            messageId,
            isRead :true,
            chatId
          });
        } catch (error) {
          console.error("Error handling message read:", error);
        }
      });
      socket.on("setup", (userData) => {
        onlineUsers.set(userData._id, socket.id);
        // Broadcast the updated online users list to all clients.
        io.emit("online users", Array.from(onlineUsers.keys()));
      });


      socket.on("add group member", async (data) => {
        try {
          const { chatId, userId, tenantId } = data;
          

          const tenantConnection = await getTenantConnection(tenantId);
          if (!tenantConnection) {
            console.error("Tenant connection not found for tenantId:", tenantId);
            return;
          }
      
          // Add member to group
          const updatedChat = await chatService.addToGroup(
            tenantConnection,
            chatId,
            userId
          );
      
          // Broadcast to all users in the chat that a new member was added
          socket.to(chatId).emit("group member added", {
            chat: updatedChat,
            userId: userId
          });
      
          // Send acknowledgment back to sender
          socket.emit("group member added", {
            chat: updatedChat,
            userId: userId
          });
        } catch (error) {
          console.error("Error adding group member:", error);
          socket.emit("error", { message: "Failed to add member to group." });
        }
      });
      
      socket.on("remove group member", async (data) => {
        try {
          const { chatId, userId, tenantId } = data;
          
          const tenantConnection = await getTenantConnection(tenantId);
          if (!tenantConnection) {
            console.error("Tenant connection not found for tenantId:", tenantId);
            return;
          }
      
          // Remove member from group
          const updatedChat = await chatService.removeFromGroup(
            tenantConnection,
            chatId,
            userId
          );
      
          // Broadcast to all users in the chat that a member was removed
          socket.to(chatId).emit("group member removed", {
            chat: updatedChat,
            userId: userId
          });
      
          // Send acknowledgment back to sender
          socket.emit("group member removed", {
            chat: updatedChat,
            userId: userId
          });
        } catch (error) {
          console.error("Error removing group member:", error);
          socket.emit("error", { message: "Failed to remove member from group." });
        }
      });
    
      // Event: disconnect
      socket.on("disconnect", () => {
        // Find the userId by socket.id.
        for (const [userId, sId] of onlineUsers.entries()) {
          if (sId === socket.id) {
            onlineUsers.delete(userId);
            break;
          }
        }
        io.emit("online users", Array.from(onlineUsers.keys()));
        console.log("User disconnected:", socket.id);
      });
  });

  return io;
};
