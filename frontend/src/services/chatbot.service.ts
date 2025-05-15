import api from '@/api/axios';

class ChatBotService {
  async getBotResponse(query: string): Promise<string> {
    try {
      const response = await api.post('/chatbot/message', { query });
      return response.data.message;
    } catch (error) {
      console.error("Error calling chatbot API:", error);
      throw error;
    }
  }
}

export default new ChatBotService();
