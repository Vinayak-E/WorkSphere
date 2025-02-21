import mongoose, { Connection, Document } from "mongoose";


export interface IMeetModel extends Document {
  meetTitle: string;
  meetDate: Date;
  meetTime: string;
  isDaily: boolean;
  members: mongoose.Types.ObjectId[];
  meetId: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
export interface IMeetService {
  getMeetings(tenantConnection: Connection, filters: any, userId: any): Promise<IMeetModel[]>
  createMeeting(tenantConnection: Connection, meetData: any): Promise<IMeetModel>
}