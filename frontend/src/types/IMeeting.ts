export interface Member {
  _id: string;
  name: string;
  email: string;
}

export interface Meeting {
  _id: string;
  meetTitle: string;
  meetDate: string;
  meetTime: string;
  members: Member[];
  meetId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetMeetingsParams {
  page: number;
  pageSize: number;
  dateFilter?: string;
  startDate?: string;
  endDate?: string;
}

export interface MeetingResponse {
  success: boolean;
  data: Meeting[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
