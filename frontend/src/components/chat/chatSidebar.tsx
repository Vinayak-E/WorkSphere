import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Plus } from 'lucide-react';

const ChatSidebar = ({
  chats,
  selectedChat,
  setSelectedChat,
  chatSearchTerm,
  setChatSearchTerm,
  currentUser,
  employees,         // Array of all employees
  loadingEmployees,  // Boolean flag for loading state
  startNewChat       // Function to start a new chat given an employee id
}) => {
  // Local state for controlling the new chat modal and search inside the modal
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
  const [filteredEmployees, setFilteredEmployees] = useState([]);

  // Filter employees (exclude the current user) based on the search term
  useEffect(() => {
    if (employees && employees.length > 0) {
      setFilteredEmployees(
        employees.filter((emp) =>
          emp._id !== currentUser.userData._id &&
          (emp.name.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
            emp.email.toLowerCase().includes(employeeSearchTerm.toLowerCase()))
        )
      );
    }
  }, [employeeSearchTerm, employees, currentUser]);

  console.log('employees on sidebar', employees);
  console.log('currentuser on sidebar', currentUser);
  console.log('chats ', chats);

  return (
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
        {chats.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No chats available</div>
        ) : (
          <div className="divide-y">
            {chats.map((chat) => {
              // Identify the other user in a one-on-one chat
              const otherUser = chat.users.find(
                (u) => String(u._id) !== String(currentUser.userData._id)
              );

              // For group chat, use chat.name or chat.chatName (whichever is populated).
              // For one-on-one, use the other user's name.
              const displayName = chat.isGroupChat
                ? chat.name || chat.chatName || 'Unnamed Group'
                : otherUser?.name || 'Unknown';

              return (
                <div
                  key={chat._id}
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedChat?._id === chat._id ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedChat(chat)}
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-500">
                      {chat.isGroupChat ? (
                        // For group chats, fall back to displaying the first letter of the group name.
                        <span className="text-white text-lg">{displayName[0] ?? '?'}</span>
                      ) : (
                        (() => {
                          if (otherUser?.profilePicture) {
                            return (
                              <img
                                src={otherUser.profilePicture}
                                alt={otherUser.name}
                                className="w-full h-full object-cover rounded-full"
                              />
                            );
                          } else {
                            return (
                              <span className="text-white text-lg">
                                {otherUser?.name[0] ?? '?'}
                              </span>
                            );
                          }
                        })()
                      )}
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="font-medium">{displayName}</div>
                      <div className="text-sm text-gray-500 truncate">
                        {chat.latestMessage?.content || 'No messages yet'}
                      </div>
                    </div>
                    {chat.latestMessage && (
                      <div className="text-xs text-gray-400">
                        {new Date(chat.latestMessage.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* New Chat Dialog */}
      <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>New Chat</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <Input
              placeholder="Search employees..."
              value={employeeSearchTerm}
              onChange={(e) => setEmployeeSearchTerm(e.target.value)}
              className="mb-4"
              prefix={<Search className="h-4 w-4 text-gray-400" />}
            />
            <ScrollArea className="h-[400px] pr-4">
              {loadingEmployees ? (
                <div className="text-center text-gray-500 py-4">Loading employees...</div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {filteredEmployees.map((employee) => (
                    <div
                      key={employee._id}
                      className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => {
                        startNewChat(employee._id);
                        setIsNewChatOpen(false);
                        setEmployeeSearchTerm('');
                      }}
                    >
                      <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-500">
                        {employee.profilePicture ? (
                          <img
                            src={employee.profilePicture}
                            alt={employee.name}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <span className="text-white text-lg">{employee.name[0]}</span>
                        )}
                      </div>
                      <div className="ml-3">
                        <div className="font-medium">{employee.name}</div>
                        <div className="text-sm text-gray-500">{employee.email}</div>
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

export default ChatSidebar;
