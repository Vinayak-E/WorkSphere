import api from "@/api/axios";


export const chatService = {
  // Create a one-on-one chat
  createChat: async (userId: string) => {
    const response = await api.post('/chat', { userId });
    return response.data;
  },

  // Create a group chat
  createGroupChat: async (name: string, users: string[]) => {
    const response = await api.post('/chat/group', { name, users });
    return response.data;
  },

  // Get user's chats
  getChats: async () => {
    const response = await api.get('/chat');
    return response.data;
  },

  // Get messages for a specific chat
  getChatMessages: async (chatId: string) => {
    const response = await api.get(`/chat/${chatId}/messages`);
    return response.data;
  },

  getAllEmployees: async () => {
    const response = await api.get(`/company/employees`);
    return response.data;
  }
};