import { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { chatService } from '@/services/chat.service';
import ChatSidebar from './chatSidebar';
import ChatWindow from './chatWindow';
import { useSocket } from '@/contexts/SocketContest';
import { RootState } from '@/redux/store';
import { IChat, IMessage, IUser } from '@/types/shared/IChat';
import { IEmployee } from '@/types/IEmployee';

const ChatContainer = () => {
  const socket = useSocket();
  const [chats, setChats] = useState<IChat[]>([]);
  const [selectedChat, setSelectedChat] = useState<IChat | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [chatSearchTerm, setChatSearchTerm] = useState('');
  const [employees, setEmployees] = useState<IEmployee[]>([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const messageAreaRef = useRef(null);

  useEffect(() => {
    loadChats();
    loadEmployees();
  }, []);

  useEffect(() => {
    if (selectedChat) {
      setMessages([]);
      loadMessages(selectedChat._id);
    }
  }, [selectedChat]);

  const loadChats = async () => {
    try {
      const response = await chatService.getChats();
      console.log('Chats API response:', response.data);
      setChats(response.data);
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  };

  const loadMessages = async (chatId: string) => {
    try {
      const response = await chatService.getChatMessages(chatId);
      console.log('load messages', response);
      setMessages(response.data);
    } catch (error) {
      console.error(`Error loading messages for chat ${chatId}:`, error);
    }
  };

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

  const handleNewMessage = useCallback(
    (newMessage: IMessage | { _doc: IMessage }) => {
      const messageData = '_doc' in newMessage ? newMessage._doc : newMessage;
      console.log('New message received:', messageData);
      setMessages(prev => [...prev, messageData]);

      setChats(prev => {
        const updatedChats = prev.map(chat => {
          if (chat._id === messageData.chat._id) {
            return {
              ...chat,
              latestMessage: {
                ...messageData,
                isRead: selectedChat?._id === messageData.chat._id,
              },
            };
          }
          return chat;
        });

        return updatedChats.sort((a, b) => {
          const dateA = a.latestMessage
            ? new Date(a.latestMessage.createdAt).getTime()
            : 0;
          const dateB = b.latestMessage
            ? new Date(b.latestMessage.createdAt).getTime()
            : 0;
          return dateB - dateA;
        });
      });
    },
    [selectedChat]
  );

  useEffect(() => {
    if (!socket) return;

    socket.on('online users', users => setOnlineUsers(users));
    socket.on('message received', handleNewMessage);
    socket.on('typing', () => setIsTyping(true));
    socket.on('stop typing', () => setIsTyping(false));

    return () => {
      socket.off('message received', handleNewMessage);
      socket.off('typing');
      socket.off('stop typing');
    };
  }, [socket, handleNewMessage]);

  useEffect(() => {
    if (selectedChat && socket) {
      socket.emit('join chat', selectedChat._id);
    }
  }, [selectedChat, socket]);

  const startNewChat = async (employeeId: string) => {
    try {
      const response = await chatService.createChat(employeeId);
      console.log('New Chat Created:', response.data);
      setChats(prev => [response.data, ...prev]);
      setSelectedChat(response.data);
    } catch (error) {
      console.error('Error starting new chat:', error);
    }
  };

  const filteredChats = chats.filter(chat => {
    let chatName;
    if (chat.isGroupChat) {
      chatName = chat.name || 'Unnamed Group';
    } else {
      const otherUser = chat.users.find(
        user =>
          currentUser?.userData &&
          user.userId._id.toString() !== currentUser.userData._id.toString()
      );
      chatName = otherUser ? otherUser.userId.name : 'Unknown User';
    }
    return chatName.toLowerCase().includes(chatSearchTerm.toLowerCase());
  });

  return (
    <div className="flex h-full bg-gray-100 overflow-hidden shadow-xl rounded-xl">
      {currentUser && (
      <ChatSidebar
        chats={filteredChats}
        selectedChat={selectedChat}
        setSelectedChat={setSelectedChat}
        chatSearchTerm={chatSearchTerm}
        setChatSearchTerm={setChatSearchTerm}
        currentUser={currentUser as unknown as { userData: IUser }}
        loadChats={loadChats}
        employees={employees}
        loadingEmployees={loadingEmployees}
        startNewChat={startNewChat}
        onlineUsers={onlineUsers}
      />
    )}
      <ChatWindow
        socket={socket}
        selectedChat={selectedChat}
        setSelectedChat={setSelectedChat}
        messages={messages}
        setMessages={setMessages}
        isTyping={isTyping}
        messageAreaRef={messageAreaRef}
        currentUser={currentUser as unknown as { userData: IUser }}
        onlineUsers={onlineUsers}
        employees={employees}
        setChats={setChats}
      />
    </div>
  );
};

export default ChatContainer;
