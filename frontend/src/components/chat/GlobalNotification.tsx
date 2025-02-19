import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useSocket } from '@/contexts/SocketContest';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: string;
  chatId: string;
  sender: string;
  content: string;
  timestamp: string;
  read: boolean;
}

const GlobalNotification = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const currentUser = useSelector((state: any) => state.auth.user);
  const navigate = useNavigate();
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;
  
    const handleNotification = (newMessage: any) => {
      const messageData = newMessage._doc || newMessage;
      console.log('Notification received:', messageData); // This should now work
      
      if (messageData.sender._id !== currentUser.userData._id) {
        setNotifications(prev => [{
          id: messageData._id,
          chatId: messageData.chat,
          sender: messageData.sender.name,
          content: messageData.content || 'New message',
          timestamp: new Date().toISOString(),
          read: false
        }, ...prev]);
      }
    };
  
    socket.on('new_notification', handleNotification);
    return () => {
      socket.off('new_notification', handleNotification);
    };
  }, [socket, currentUser.userData._id]);

  const handleNotificationClick = (notification) => {
    // Mark notification as read
    setNotifications(prev =>
      prev.map(n => 
        n.id === notification.id ? { ...n, read: true } : n
      )
    );
    
    // Navigate to the chat
    navigate(`/employee/chat?chatId=${notification.chatId}`);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative hover:bg-gray-100"
        >
          <Bell className="h-5 w-5 text-gray-600" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-blue-600 text-[10px] font-medium text-white flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className={`p-3 ${!notification.read ? 'bg-blue-50' : ''}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex flex-col gap-1">
                <div className="font-semibold">{notification.sender}</div>
                <div className="text-sm text-gray-600 truncate">{notification.content}</div>
                <div className="text-xs text-gray-400">
                  {new Date(notification.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </DropdownMenuItem>
          ))
        ) : (
          <div className="p-3 text-center text-gray-500">No new messages</div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default GlobalNotification;