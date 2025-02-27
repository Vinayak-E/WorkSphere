import React, { useState, useRef, useEffect, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, MessageSquare, PlusCircle, CheckCheck } from "lucide-react";
import MediaUpload from "./MediaUpload";
import GroupMembersModal from "./GroupMembersModal";

const ChatWindow = ({
  socket,
  selectedChat,
  setSelectedChat,
  messages,
  setMessages,
  isTyping,
  messageAreaRef,
  currentUser,
  chatService,
  onlineUsers,
  employees,
  setChats,
}) => {
  const [newMessage, setNewMessage] = useState("");
  const [showMediaUpload, setShowMediaUpload] = useState(false);
  const typingTimeoutRef = useRef(null);
  const [showGroupModal, setShowGroupModal] = useState(false);

  const handleTyping = () => {
    if (!socket || !selectedChat) return;
    socket.emit("typing", selectedChat._id);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop typing", selectedChat._id);
    }, 3000);
  };
  useEffect(() => {
    // This needs to be modified because messageAreaRef might not directly access scrollHeight
    if (messageAreaRef.current) {
      const scrollContainer = messageAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]",
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const sendMessage = async (mediaContent = null) => {
    if ((!newMessage.trim() && !mediaContent) || !socket || !selectedChat)
      return;

    try {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      socket.emit("stop typing", selectedChat._id);

      const messageContent = mediaContent
        ? {
            type: mediaContent.type,
            content: mediaContent.type === "text" ? newMessage.trim() : "",
            mediaUrl: mediaContent.url,
          }
        : {
            type: "text",
            content: newMessage,
          };

      const tempId = Date.now().toString();
      const payload = {
        tenantId: currentUser.tenantId,
        ...messageContent,
        chat: selectedChat,
        sender: currentUser,
        tempId,
      };

      const messageToAdd = {
        ...messageContent,
        sender: {
          _id: currentUser.userData._id,
          name: currentUser.userData.name,
        },
        chat: selectedChat._id,
        createdAt: new Date().toISOString(),
        isRead: false,
        _id: tempId,
      };

      setMessages((prev) => [...prev, messageToAdd]);

      socket.emit("new message", payload, (savedMessage) => {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg._id === tempId
              ? { ...savedMessage, sender: currentUser.userData }
              : msg,
          ),
        );
      });

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleMediaSelect = async (mediaContent) => {
    await sendMessage(mediaContent);
    setShowMediaUpload(false);
  };
  const getSenderId = (msg) => msg.sender?.senderId?._id || msg.sender?._id;
  const getSenderName = (msg) => msg.sender?.senderId?.name || msg.sender?.name;

  const markMessagesAsRead = useCallback(() => {
    if (!selectedChat || !currentUser || !socket) return;
    if (!selectedChat.isGroupChat) {
      const unreadMessages = messages.filter(
        (msg) => getSenderId(msg) !== currentUser.userData._id && !msg.isRead,
      );
      if (unreadMessages.length > 0) {
        unreadMessages.forEach((msg) => {
          if (!msg._beingMarkedAsRead) {
            msg._beingMarkedAsRead = true;
            socket.emit("message read", {
              messageId: msg._id,
              chatId: selectedChat._id,
              tenantId: currentUser.tenantId,
              readerId: currentUser.userData._id,
            });
          }
        });
      }
    }
  }, [selectedChat, messages, currentUser, socket]);
  useEffect(() => {
    if (!socket) return;

    const handleMessageReadUpdate = ({ messageId, isRead, chatId }) => {
      if (selectedChat && selectedChat._id === chatId) {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg._id === messageId ? { ...msg, isRead } : msg,
          ),
        );
      }

      setChats((prevChats) =>
        prevChats.map((chat) => {
          if (
            chat._id === chatId &&
            chat.latestMessage &&
            chat.latestMessage._id === messageId
          ) {
            return {
              ...chat,
              latestMessage: {
                ...chat.latestMessage,
                isRead: true,
              },
            };
          }
          return chat;
        }),
      );
      console.log("chat latest", chat.latestMessage);
    };

    socket.on("message read update", handleMessageReadUpdate);

    return () => {
      socket.off("message read update", handleMessageReadUpdate);
    };
  }, [socket, selectedChat, setChats, setMessages]);
  useEffect(() => {
    if (selectedChat && messages.length > 0) {
      markMessagesAsRead();
    }
  }, [selectedChat, messages, markMessagesAsRead]);

  useEffect(() => {
    if (selectedChat && messages.length > 0) {
      markMessagesAsRead();
    }
  }, [selectedChat, messages, markMessagesAsRead]);

  // Call it once when new messages arrive
  useEffect(() => {
    if (selectedChat && !selectedChat.isGroupChat) {
      const timer = setTimeout(() => {
        markMessagesAsRead();
      }, 1000); // Small delay to batch updates

      return () => clearTimeout(timer);
    }
  }, [messages.length, selectedChat, markMessagesAsRead]);
  const fixedSize = "w-80 h-60";

  const renderMessage = (msg) => {
    if (msg.type === "image") {
      return (
        <img
          src={msg.mediaUrl}
          alt="Shared image"
          className={`${fixedSize} object-cover rounded-lg border-2 border-blue-500 cursor-pointer`}
          onClick={() => window.open(msg.mediaUrl, "_blank")}
        />
      );
    } else if (msg.type === "video") {
      return (
        <video
          src={msg.mediaUrl}
          className={`${fixedSize} object-cover rounded-lg border-2 border-blue-500`}
          controls
        />
      );
    }
    return <p className="text-gray">{msg.content}</p>;
  };

  const otherUser =
    selectedChat && !selectedChat.isGroupChat
      ? selectedChat.users.find(
          (user) =>
            String(user.userId._id || user._id) !==
            String(currentUser.userData._id),
        )
      : null;

  const isOnline =
    otherUser && onlineUsers
      ? onlineUsers.includes(otherUser.userId._id)
      : false;
  ////////////////////////////////////////////////////////////////////////////
  const handleAddMember = async (userId) => {
    try {
      if (!socket || !selectedChat) return;

      socket.emit("add group member", {
        chatId: selectedChat._id,
        userId: userId,
        tenantId: currentUser.tenantId,
      });
    } catch (error) {
      console.error("Error adding member:", error);
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      if (!socket || !selectedChat) return;

      socket.emit("remove group member", {
        chatId: selectedChat._id,
        userId: userId,
        tenantId: currentUser.tenantId,
      });
    } catch (error) {
      console.error("Error removing member:", error);
    }
  };

  // Add socket listeners for group updates
  useEffect(() => {
    if (!socket) return;

    const handleGroupUpdate = ({ chat, userId }) => {
      // Update the selected chat if it's the current chat
      if (selectedChat?._id === chat._id) {
        setSelectedChat(chat);
      }

      // Update the chats list
      setChats((prevChats) =>
        prevChats.map((prevChat) =>
          prevChat._id === chat._id ? chat : prevChat,
        ),
      );
    };

    socket.on("group member added", handleGroupUpdate);
    socket.on("group member removed", handleGroupUpdate);

    return () => {
      socket.off("group member added", handleGroupUpdate);
      socket.off("group member removed", handleGroupUpdate);
    };
  }, [socket, selectedChat, setChats]);

  ////////////////////////////////////////////////////////////////////////////
  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {selectedChat ? (
        <>
          {/* Chat Header */}
          <div className="p-4 bg-white border-b shadow-sm">
            <div className="flex items-center">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                  {selectedChat.isGroupChat ? (
                    selectedChat.name?.[0]
                  ) : otherUser?.userId.profilePicture ? (
                    <img
                      src={otherUser.userId.profilePicture}
                      alt={otherUser.userId.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    otherUser?.userId.name?.[0] || "?"
                  )}
                </div>
                {!selectedChat.isGroupChat && (
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                      isOnline ? "bg-green-500" : "bg-gray-400"
                    }`}
                  ></span>
                )}
              </div>
              <div className="ml-3">
                <div
                  className={`font-semibold text-gray-900 ${
                    selectedChat.isGroupChat
                      ? "cursor-pointer hover:text-blue-500"
                      : ""
                  }`}
                  onClick={() => {
                    if (selectedChat.isGroupChat) {
                      setShowGroupModal(true);
                    }
                  }}
                >
                  {selectedChat.isGroupChat
                    ? selectedChat.name
                    : otherUser?.userId.name}
                </div>
                {isTyping && (
                  <div className="text-sm text-blue-500 flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-150"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Messages Area */}
          <ScrollArea
            className="flex-1 p-4"
            ref={messageAreaRef}
            onScroll={() => markMessagesAsRead()}
          >
            <div className="space-y-4">
              {messages.map((msg, index) => {
                const senderId = getSenderId(msg);
                const senderName = getSenderName(msg);
                const isSender = senderId === currentUser.userData._id;
                const showAvatar =
                  index === 0 || getSenderId(messages[index - 1]) !== senderId;

                return (
                  <div
                    key={msg._id || index}
                    className={`flex items-end gap-2 ${isSender ? "justify-end" : "justify-start"}`}
                  >
                    {!isSender && showAvatar && (
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0 flex items-center justify-center text-sm font-medium text-gray-600">
                        {senderName?.[0] || "?"}
                      </div>
                    )}
                    <div
                      className={`max-w-[70%] group relative ${!showAvatar && !isSender ? "ml-10" : ""}`}
                    >
                      <div
                        className={`p-3 rounded-2xl ${
                          isSender
                            ? "bg-blue-500 text-white rounded-br-none"
                            : "bg-white text-gray-900 rounded-bl-none shadow-sm"
                        }`}
                      >
                        {renderMessage(msg)}
                      </div>
                      <div
                        className={`text-xs mt-1 flex items-center gap-1 ${isSender ? "justify-end" : "justify-start"}`}
                      >
                        <span className="text-gray-500">
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {isSender && (
                          <CheckCheck
                            className={`h-3 w-3 ${
                              selectedChat.isGroupChat
                                ? "text-gray-400"
                                : msg.isRead
                                  ? "text-blue-400"
                                  : "text-gray-400"
                            }`}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="p-4 bg-white border-t">
            <div className="flex gap-2 items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowMediaUpload(true)}
                className="rounded-full"
              >
                <PlusCircle className="h-5 w-5" />
              </Button>
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  handleTyping();
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Type a message..."
                className="flex-grow bg-gray-50 rounded-full px-4 py-2"
              />
              <Button
                onClick={() => sendMessage()}
                size="icon"
                className="rounded-full bg-blue-500 hover:bg-blue-600"
              >
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
      {showMediaUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <MediaUpload
            onMediaSelect={handleMediaSelect}
            onClose={() => setShowMediaUpload(false)}
          />
        </div>
      )}
      {selectedChat?.isGroupChat && showGroupModal && (
        <GroupMembersModal
          isOpen={showGroupModal}
          onClose={() => setShowGroupModal(false)}
          groupChat={selectedChat}
          allUsers={employees}
          onlineUsers={onlineUsers}
          currentUser={currentUser.userData}
          onAddMember={handleAddMember}
          onRemoveMember={handleRemoveMember}
        />
      )}
    </div>
  );
};

export default ChatWindow;
