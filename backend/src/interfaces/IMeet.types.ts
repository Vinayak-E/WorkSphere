import mongoose, {Document } from 'mongoose';

export interface IMeetModel extends Document {
  meetTitle: string;
  meetDate: Date;
  meetTime: string;
  members: mongoose.Types.ObjectId[];
  meetId: string;
  createdBy: mongoose.Types.ObjectId;
  createdByModel: 'Employee' | 'Company';
  createdAt: Date;
  updatedAt: Date;
}