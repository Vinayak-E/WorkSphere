import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { chatService } from '@/services/employee/chat.service';
import ChatSidebar from './chatSidebar';
import ChatWindow from './chatWindow';

const ChatContainer = () => {
  const [socket, setSocket] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [chatSearchTerm, setChatSearchTerm] = useState('');
  const [employees, setEmployees] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]); 
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const currentUser = useSelector((state) => state.auth.user);
  const messageAreaRef = useRef(null);

  // Load chats when component mounts
  useEffect(() => {
    loadChats();
  }, []);

  // Load messages when a chat is selected
  useEffect(() => {
    if (selectedChat) {
      setMessages([]);
      loadMessages(selectedChat._id);
    }
  }, [selectedChat]);

  // Load all employees when component mounts
  useEffect(() => {
    loadEmployees();
  }, []);

  // Fetch chat list from backend
  const loadChats = async () => {
    try {
      const response = await chatService.getChats();
        console.log("Chats API response:", response.data);
      setChats(response.data);
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  };

  // Fetch messages for a specific chat
  const loadMessages = async (chatId) => {
    try {
      // Changed getMessages to getChatMessages
      const response = await chatService.getChatMessages(chatId);
      setMessages(response.data);
    } catch (error) {
      console.error(`Error loading messages for chat ${chatId}:`, error);
    }
  };

  // Fetch employees for new chat creation
  const loadEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const response = await chatService.getAllEmployees();
      setEmployees(response.data);
    } catch (error) {
      console.error('Error loading employees:', error);
    } finally {
      setLoadingEmployees(false);
    }
  };

  // Handle an incoming new message via socket
  const handleNewMessage = useCallback((newMessage) => {
    const messageData = newMessage._doc || newMessage;
    console.log('new message Received',newMessage)
    setMessages(prev => [...prev, messageData]);
    
    // Scroll to bottom after new message
    if (messageAreaRef.current) {
      messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
    }
  
    // Update chats list with new message
    setChats(prev => {
      const updatedChats = prev.map(chat => {
        if (chat._id === (messageData.chat._id || messageData.chatId)) {
          return {
            ...chat,
            latestMessage: {
              ...messageData,
              isRead: selectedChat?._id === (messageData.chat._id || messageData.chatId)
            }
          };
        }
        return chat;
      });
  
      // Sort chats by latest message
      return updatedChats.sort((a, b) => {
        const dateA = a.latestMessage ? new Date(a.latestMessage.createdAt) : new Date(0);
        const dateB = b.latestMessage ? new Date(b.latestMessage.createdAt) : new Date(0);
        return dateB - dateA;
      });
    });
  }, [selectedChat]);

    // Set up socket connection (runs once on mount)
    useEffect(() => {
        const newSocket = io('http://localhost:5000', {
          withCredentials: true,
        });
    
        newSocket.on('connect', () =>
          console.log('Connected to socket server', newSocket.id)
        );
        newSocket.emit("setup", currentUser.userData);

        newSocket.on('online users', (users) => {
          setOnlineUsers(users);
        });
        newSocket.on('message received', handleNewMessage);
        newSocket.on('typing', () => setIsTyping(true));
        newSocket.on('stop typing', () => setIsTyping(false));
    
        setSocket(newSocket);
        return () => {
            newSocket.off('message received', handleNewMessage);
            newSocket.off('typing');
            newSocket.off('stop typing');
            newSocket.disconnect();
          };
        }, [handleNewMessage,currentUser.userData]); 
      
  useEffect(() => {
    if (selectedChat && socket) {
     
      socket.emit("join chat", selectedChat._id);
    }
  }, [selectedChat, socket]);

  // Function to start a new chat by selecting an employee
  const startNewChat = async (employeeId) => {
    try {
      const response = await chatService.createChat(employeeId);
      console.log("New Chat Created:", response.data);
      setChats((prev) => [response.data, ...prev]);
      setSelectedChat(response.data);
    } catch (error) {
      console.error('Error starting new chat:', error);
    }
  };

  // Filter chats based on the chat search term
  const filteredChats = chats.filter((chat) => {
    // For group chats, assume chat.chatName is available.
    // For one-on-one chats, display the other user's name.
    const chatName = chat.isGroupChat
      ? chat.name
      : chat.users.find((user) => user._id !== currentUser.userData._id)?.name;
    return chatName.toLowerCase().includes(chatSearchTerm.toLowerCase());
  });

  return (
    <div className="flex h-full bg-gray-100 overflow-hidden shadow-xl rounded-xl ">
      <ChatSidebar
        chats={filteredChats}
        selectedChat={selectedChat}
        setSelectedChat={setSelectedChat}
        chatSearchTerm={chatSearchTerm}
        setChatSearchTerm={setChatSearchTerm}
        currentUser={currentUser}
        loadChats={loadChats}
        employees={employees}
        loadingEmployees={loadingEmployees}
        startNewChat={startNewChat}
        onlineUsers={onlineUsers}
      />
      <ChatWindow
        socket={socket}
        selectedChat={selectedChat}
        setSelectedChat={setSelectedChat} 
        messages={messages}
        setMessages={setMessages}
        isTyping={isTyping}
        messageAreaRef={messageAreaRef}
        currentUser={currentUser}
        chatService={chatService}
        onlineUsers={onlineUsers} 
        employees={employees} 
        setChats={setChats} 
      />
    </div>
  );
};

export default ChatContainer;
