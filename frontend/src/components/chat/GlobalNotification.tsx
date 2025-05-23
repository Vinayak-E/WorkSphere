import  { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useSelector } from "react-redux";
import { useSocket } from "@/contexts/SocketContest";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RootState } from "@/redux/store";
interface Notification {
  id: string;
  chatId: string;
  sender: string;
  content: string;
  timestamp: string;
  read: boolean;
}
const GlobalNotification = () => {
  const [notifications, setNotifications] =useState<Notification[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [latestNotification, setLatestNotification] = useState<Notification | null>(null);
  const currentUser = useSelector((state :RootState) => state.auth.user);
  const navigate = useNavigate();
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleNotification = (newMessage :any) => {
      const messageData = newMessage._doc || newMessage;
      console.log("Notification received:", messageData);

      if (messageData.sender._id !== currentUser?.userData?._id) {
        const notification: Notification = {
          id: messageData._id,
          chatId: messageData.chat,
          sender: messageData.sender.name,
          content: messageData.content || "New message",
          timestamp: new Date().toISOString(),
          read: false,
        };

        setNotifications((prev) => [notification, ...prev]);
        setLatestNotification(notification);
        setShowToast(true);

        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      }
    };
    const handleMessageReadUpdate = ({ messageId , chatId  }: {
      messageId: string;
      chatId: string;
    }) => {
      setNotifications((prev) =>
        prev.filter(
          (notification) =>
            !(notification.id === messageId || notification.chatId === chatId),
        ),
      );

      if (
        latestNotification &&
        (latestNotification.id === messageId ||
          latestNotification.chatId === chatId)
      ) {
        setShowToast(false);
      }
    };

    socket.on("new_notification", handleNotification);
    socket.on("message read update", handleMessageReadUpdate);

    return () => {
      socket.off("new_notification", handleNotification);
      socket.off("message read update", handleMessageReadUpdate);
    };
  }, [socket, currentUser?.userData?._id, latestNotification]);

  const handleNotificationClick = (notification:Notification) => {
    setNotifications((prev) =>
      prev.filter((n) => n.chatId !== notification.chatId),
    );

    setShowToast(false);
    navigate(`/employee/chat?chatId=${notification.chatId}`);
  };

  useEffect(() => {
    const handleURLChange = () => {
      const chatIdMatch = window.location.href.match(/chatId=([^&]*)/);
      if (chatIdMatch) {
        const chatId = chatIdMatch[1];
        setNotifications((prev) =>
          prev.filter((notification) => notification.chatId !== chatId),
        );
      }
    };
    handleURLChange();

    window.addEventListener("popstate", handleURLChange);
    return () => window.removeEventListener("popstate", handleURLChange);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative">

      {showToast && latestNotification && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <Alert
            className="cursor-pointer bg-white shadow-lg hover:bg-gray-50 transition-colors"
            onClick={() => handleNotificationClick(latestNotification)}
          >
            <AlertTitle className="text-sm font-semibold">
              New message from {latestNotification.sender}
            </AlertTitle>
            <AlertDescription className="text-sm mt-1">
              {latestNotification.content}
            </AlertDescription>
          </Alert>
        </div>
      )}


      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
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
                className="flex flex-col items-start p-3"
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="font-semibold">{notification.sender}</div>
                <div className="text-sm text-gray-600 mt-1">
                  {notification.content}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(notification.timestamp).toLocaleTimeString()}
                </div>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">No new messages</div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default GlobalNotification;
