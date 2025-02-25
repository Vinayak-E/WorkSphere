import api from "@/api/axios";
import { GetMeetingsParams, MeetingResponse } from "@/types/IMeeting";

export const meetService = {
  getMeetings: async (params: GetMeetingsParams): Promise<MeetingResponse> => {
    try {
      const queryParams = new URLSearchParams();
      

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      const response = await api.get<MeetingResponse>(`/meetings?${queryParams.toString()}`);
      console.log("response",response.data)
      return response.data;
    } catch (error) {
      // Add error handling
      throw new Error(`Failed to fetch meetings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
  
  createMeeting: async (meetingData) => {
    const response = await api.post("/meetings", meetingData);
    return response.data;
  },
  updateMeeting: async (id: string, meetingData: any) => {
    try {
      const response = await api.put(`/meetings/${id}`, meetingData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update meeting: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  deleteMeeting :async (meetingId :string) =>{
    try{
       await api.delete(`/meetings/${meetingId}`)
    } catch (error) {
      throw new Error(`Failed to Delete meeting: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
};
