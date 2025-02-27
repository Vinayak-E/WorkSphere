import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Plus, Users, MessageSquare, Check } from 'lucide-react';
import { chatService } from '@/services/employee/chat.service';
const ChatSidebar = ({
  chats,
  selectedChat,
  setSelectedChat,
  chatSearchTerm,
  setChatSearchTerm,
  currentUser,
  loadChats,
  employees,
  loadingEmployees,
  startNewChat,
  onlineUsers,

}) => {
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [activeTab, setActiveTab] = useState('chats');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState('');

  const handleCreateGroup = async () => {
    if (!groupName || selectedUsers.length < 2) {

      return;
    }
    const groupMemberIds = [
      ...selectedUsers.map(user => user._id),
      currentUser.userData._id
    ];
    
    try {
      const response = await chatService.createGroupChat(
        groupName,
        groupMemberIds
      );
      await loadChats();
      setSelectedChat(response.data);
      setIsNewChatOpen(false);
      resetGroupForm();
    } catch (error) {
      console.error('Error creating group:', error);

    }
  };

  const resetGroupForm = () => {
    setSelectedUsers([]);
    setGroupName('');
    setEmployeeSearchTerm('');
  };

  const toggleUserSelection = (employee) => {
    setSelectedUsers(prev => {
      const isSelected = prev.find(u => u._id === employee._id);
      if (isSelected) {
        return prev.filter(u => u._id !== employee._id);
      }
      return [...prev, employee];
    });
  };

  const handleCloseDialog = () => {
    setIsNewChatOpen(false);
    resetGroupForm();
  };

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

  const filteredItems = chats.filter((chat) => {
    const otherUser = chat.users.find(
      (u) => String(u._id) !== String(currentUser.userData._id)
    );
    const displayName = chat.isGroupChat
      ? chat.name || chat.chatName || 'Unnamed Group'
      : otherUser?.name || 'Unknown';
    
    const matchesSearch = displayName.toLowerCase().includes(chatSearchTerm.toLowerCase());
    const matchesType = activeTab === 'groups' ? chat.isGroupChat : !chat.isGroupChat;
    
    return matchesSearch && matchesType;
  });

  return (
    <div className="flex flex-col w-1/3 bg-white border-r">
      {/* Header */}
      <div className="p-4 bg-gray-50 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Messages</h2>
          {(activeTab === 'chats' ||
            (activeTab === 'groups' && currentUser.userData.role === 'MANAGER')) && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsNewChatOpen(true)}
              className="hover:bg-gray-200 rounded-full"
            >
              <Plus className="h-5 w-5" />
            </Button>
          )}
        </div>

        <Input
          placeholder="Search messages..."
          value={chatSearchTerm}
          onChange={(e) => setChatSearchTerm(e.target.value)}
          className="w-full bg-gray-100 mb-4"
          prefix={<Search className="h-4 w-4 text-gray-400" />}
        />

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('chats')}
            className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'chats'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Chats</span>
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'groups'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Groups</span>
          </button>
        </div>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        {filteredItems.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No {activeTab} available
          </div>
        ) : (
          <div className="divide-y">
           {filteredItems.map((chat) => {
  const otherUser = chat.users.find(
    (u) => String(u.userId._id) !== String(currentUser.userData._id)
  );
  const displayName = chat.isGroupChat
    ? chat.name || chat.chatName || 'Unnamed Group'
    : otherUser?.userId?.name || 'Unknown';
  const isOnline = !chat.isGroupChat && otherUser && onlineUsers.includes(otherUser.userId._id);

  return (
    <div
      key={chat._id}
      className={`p-4 cursor-pointer transition-colors ${
        selectedChat?._id === chat._id ? 'bg-blue-50' : 'hover:bg-gray-50'
      }`}
      onClick={() => setSelectedChat(chat)}
    >
      <div className="flex items-center">
        <div className="relative">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-500">
            {chat.isGroupChat ? (
              <span className="text-white text-lg">
                {displayName && typeof displayName === 'string' ? displayName[0] : '?'}
              </span>
            ) : (
              (() => {
                if (otherUser?.userId?.profilePicture) {
                  return (
                    <img
                      src={otherUser.userId.profilePicture}
                      alt={otherUser.userId.name || 'Unknown'}
                      className="w-full h-full object-cover rounded-full"
                    />
                  );
                } else {
                  return (
                    <span className="text-white text-lg">
                      {otherUser?.userId?.name && typeof otherUser.userId.name === 'string'
                        ? otherUser.userId.name[0]
                        : '?'}
                    </span>
                  );
                }
              })()
            )}
          </div>
          {isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
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

      {/* New Chat/Group Dialog */}
      <Dialog open={isNewChatOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>New {activeTab === 'groups' ? 'Group' : 'Chat'}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {activeTab === 'groups' && (
              <Input
                placeholder="Group Name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="mb-4"
              />
            )}
            
            <Input
              placeholder="Search employees..."
              value={employeeSearchTerm}
              onChange={(e) => setEmployeeSearchTerm(e.target.value)}
              className="mb-4"
              prefix={<Search className="h-4 w-4 text-gray-400" />}
            />

            {activeTab === 'groups' && (
              <div className="mb-4">
                <div className="text-sm text-gray-500 mb-2">
                  Selected Users ({selectedUsers.length}):
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map((user) => (
                    <div
                      key={user._id}
                      className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm flex items-center"
                    >
                      {user.name}
                      <button
                        onClick={() => toggleUserSelection(user)}
                        className="ml-2 hover:text-blue-900"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <ScrollArea className="h-[300px] pr-4">
              {loadingEmployees ? (
                <div className="text-center text-gray-500 py-4">Loading employees...</div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {filteredEmployees.map((employee) => (
                    <div
                      key={employee._id}
                      className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors
                        ${activeTab === 'groups'
                          ? selectedUsers.find(u => u._id === employee._id)
                            ? 'bg-blue-50'
                            : 'hover:bg-gray-50'
                          : 'hover:bg-gray-50'
                        }`}
                      onClick={() => {
                        if (activeTab === 'groups') {
                          toggleUserSelection(employee);
                        } else {
                          startNewChat(employee._id);
                          handleCloseDialog();
                        }
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
                      <div className="ml-3 flex-1">
                        <div className="font-medium">{employee.name}</div>
                        <div className="text-sm text-gray-500">
                          {employee.role.charAt(0).toUpperCase() + employee.role.slice(1).toLowerCase()}
                        </div>
                        <div className="text-sm text-gray-500">{employee.email}</div>
                      </div>
                      {activeTab === 'groups' && selectedUsers.find(u => u._id === employee._id) && (
                        <Check className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {activeTab === 'groups' && (
              <div className="mt-4 flex justify-end">
                <Button
                  onClick={handleCreateGroup}
                  disabled={!groupName || selectedUsers.length < 2}
                >
                  Create Group
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatSidebar;