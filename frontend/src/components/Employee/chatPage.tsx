import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  Send,
  Plus,
  ChevronLeft,
  X,
  User,
  Users,
  MessageSquare,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { chatService } from "@/services/employee/chat.service";

const ChatComponent = () => {
  const [socket, setSocket] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [chatSearchTerm, setChatSearchTerm] = useState("");
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const typingTimeoutRef = useRef(null);
  const messageAreaRef = useRef(null);

  const currentUser = useSelector((state) => state.auth.user);

  // Socket connection setup
  useEffect(() => {
    const newSocket = io("http://localhost:5000", {
      withCredentials: true,
    });

    newSocket.on("connect", () => console.log("Connected to socket server"));
    newSocket.on("message received", handleNewMessage);
    newSocket.on("typing", () => setIsTyping(true));
    newSocket.on("stop typing", () => setIsTyping(false));

    setSocket(newSocket);
    return () => newSocket.disconnect();
  }, []);

  // Load initial chats
  useEffect(() => {
    loadChats();
  }, []);

  // Load all employees
  useEffect(() => {
    loadEmployees();
  }, []);

  // Filter employees based on search
  useEffect(() => {
    if (employees.length) {
      const filtered = employees.filter(
        (emp) =>
          emp._id !== currentUser._id &&
          (emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.email.toLowerCase().includes(searchTerm.toLowerCase())),
      );
      setFilteredEmployees(filtered);
    }
  }, [searchTerm, employees]);

  const loadChats = async () => {
    try {
      setLoadingChats(true);
      const response = await chatService.getChats();
      setChats(response.data);
    } catch (error) {
      console.error("Error loading chats:", error);
    } finally {
      setLoadingChats(false);
    }
  };

  const loadEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const response = await chatService.getAllEmployees();
      console.log("response dat", response);

      setEmployees(response.data);
      setFilteredEmployees(
        response.data.filter((emp) => emp._id !== currentUser._id),
      );
    } catch (error) {
      console.error("Error loading employees:", error);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const handleNewMessage = (newMessage) => {
    setMessages((prev) => [...prev, newMessage]);
    setChats((prev) => {
      const updatedChats = [...prev];
      const chatIndex = updatedChats.findIndex(
        (chat) => chat._id === newMessage.chat._id,
      );
      if (chatIndex !== -1) {
        const updatedChat = { ...updatedChats[chatIndex] };
        updatedChat.latestMessage = newMessage;
        updatedChats.splice(chatIndex, 1);
        updatedChats.unshift(updatedChat);
      }
      return updatedChats;
    });
  };

  const startNewChat = async (userId) => {
    try {
      const response = await chatService.createChat(userId);
      setChats((prev) => [response.data, ...prev]);
      setSelectedChat(response.data);
      setIsNewChatOpen(false);
      setSearchTerm("");
    } catch (error) {
      console.error("Error starting new chat:", error);
    }
  };

  const handleTyping = () => {
    if (!socket) return;

    socket.emit("typing", selectedChat._id);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop typing", selectedChat._id);
    }, 3000); // Stop typing indicator after 3 seconds of no input
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !socket || !selectedChat) return;

    try {
      // Clear typing timeout and emit stop typing
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      socket.emit("stop typing", selectedChat._id);

      const response = await chatService.sendMessage({
        content: newMessage,
        chatId: selectedChat._id,
      });

      socket.emit("new message", response.data);
      setMessages((prev) => [...prev, response.data]);
      setNewMessage("");

      setChats((prev) => {
        const updatedChats = [...prev];
        const chatIndex = updatedChats.findIndex(
          (chat) => chat._id === selectedChat._id,
        );
        if (chatIndex !== -1) {
          const updatedChat = { ...updatedChats[chatIndex] };
          updatedChat.latestMessage = response.data;
          updatedChats.splice(chatIndex, 1);
          updatedChats.unshift(updatedChat);
        }
        return updatedChats;
      });

      // Scroll to bottom after sending message
      if (messageAreaRef.current) {
        messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const filteredChats = chats.filter((chat) => {
    const chatName = chat.isGroupChat
      ? chat.chatName
      : chat.users.find((user) => user._id !== currentUser._id)?.name;
    return chatName.toLowerCase().includes(chatSearchTerm.toLowerCase());
  });

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex flex-col w-1/3 bg-white border-r">
        {/* Chat List Header */}
        <div className="p-4 bg-gray-50 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Messages</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsNewChatOpen(true)}
              className="hover:bg-gray-200 rounded-full"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
          <Input
            placeholder="Search chats..."
            value={chatSearchTerm}
            onChange={(e) => setChatSearchTerm(e.target.value)}
            className="w-full bg-gray-100"
            prefix={<Search className="h-4 w-4 text-gray-400" />}
          />
        </div>

        {/* Chat List */}
        <ScrollArea className="flex-1">
          {loadingChats ? (
            <div className="p-4 text-center text-gray-500">
              Loading chats...
            </div>
          ) : (
            <div className="divide-y">
              {filteredChats.map((chat) => (
                <div
                  key={chat._id}
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedChat?._id === chat._id
                      ? "bg-blue-50"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedChat(chat)}
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white text-lg">
                      {chat.isGroupChat
                        ? chat.chatName[0]
                        : chat.users.find(
                            (user) => user._id !== currentUser._id,
                          )?.name[0]}
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="font-medium">
                        {chat.isGroupChat
                          ? chat.chatName
                          : chat.users.find(
                              (user) => user._id !== currentUser._id,
                            )?.name}
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        {chat.latestMessage?.content || "No messages yet"}
                      </div>
                    </div>
                    {chat.latestMessage && (
                      <div className="text-xs text-gray-400">
                        {new Date(
                          chat.latestMessage.createdAt,
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {selectedChat ? (
          <>
            <div className="p-4 bg-white border-b">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white text-lg">
                  {selectedChat.isGroupChat
                    ? selectedChat.chatName[0]
                    : selectedChat.users.find(
                        (user) => user._id !== currentUser._id,
                      )?.name[0]}
                </div>
                <div className="ml-3">
                  <div className="font-medium">
                    {selectedChat.isGroupChat
                      ? selectedChat.chatName
                      : selectedChat.users.find(
                          (user) => user._id !== currentUser._id,
                        )?.name}
                  </div>
                  {isTyping && (
                    <div className="text-sm text-gray-500">typing...</div>
                  )}
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4" ref={messageAreaRef}>
              <div className="space-y-4">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      msg.sender._id === currentUser._id
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${
                        msg.sender._id === currentUser._id
                          ? "bg-blue-500 text-white"
                          : "bg-white"
                      } shadow-sm`}
                    >
                      {msg.content}
                      <div
                        className={`text-xs mt-1 ${
                          msg.sender._id === currentUser._id
                            ? "text-blue-100"
                            : "text-gray-400"
                        }`}
                      >
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="p-4 bg-white border-t">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    handleTyping();
                    if (e.key === "Enter") sendMessage();
                  }}
                  placeholder="Type a message..."
                  className="flex-grow bg-gray-100"
                />
                <Button onClick={sendMessage} className="rounded-full">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <MessageSquare className="h-16 w-16 mb-4 text-gray-300" />
            <p className="text-lg">Select a chat or start a new conversation</p>
          </div>
        )}
      </div>

      {/* New Chat Dialog */}
      <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>New Chat</DialogTitle>
          </DialogHeader>

          <div className="mt-4">
            <Input
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-4"
              prefix={<Search className="h-4 w-4 text-gray-400" />}
            />

            <ScrollArea className="h-[400px] pr-4">
              {loadingEmployees ? (
                <div className="text-center text-gray-500 py-4">
                  Loading employees...
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {filteredEmployees.map((employee) => (
                    <div
                      key={employee._id}
                      className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => startNewChat(employee._id)}
                    >
                      <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white text-lg">
                        {employee.name[0]}
                      </div>
                      <div className="ml-3">
                        <div className="font-medium">{employee.name}</div>
                        <div className="text-sm text-gray-500">
                          {employee.email}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatComponent;
