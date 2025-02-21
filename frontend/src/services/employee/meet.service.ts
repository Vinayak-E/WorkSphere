import api from "@/api/axios";

export const meetService = {
  getMeetings: async (filters = {}) => {
    const response = await api.get(`/meetings`, { params: filters });
    return response.data;
  },
  
  createMeeting: async (meetingData) => {
    const response = await api.post("/meetings", meetingData);
    return response.data;
  },
};
