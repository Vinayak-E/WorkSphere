import mongoose, { Document } from "mongoose";


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
    
}