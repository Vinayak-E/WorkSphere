import mongoose, { Connection, Document } from "mongoose";


export interface IMeetModel extends Document {
  meetTitle: string;
  meetDate: Date;
  meetTime: string;
  members: mongoose.Types.ObjectId[];
  meetId: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
export interface IMeetService {
  getMeetings(tenantConnection: Connection, filters: any, userId: string | mongoose.Types.ObjectId, page: number, pageSize: number): Promise<{
    meetings: IMeetModel[];
    total: number;
}>
  createMeeting(tenantConnection: Connection, meetData: any): Promise<IMeetModel>
}