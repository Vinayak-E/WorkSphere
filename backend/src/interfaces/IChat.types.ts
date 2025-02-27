import mongoose, { Document } from 'mongoose';
import { IEmployee } from './company/IEmployee.types';
import { ICompanyDocument } from './company/company.types';

export interface IChatDocument extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  isGroupChat: boolean;
  users: mongoose.Types.ObjectId[];
  latestMessage?: mongoose.Types.ObjectId;
  groupAdmin?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMessageDocument extends Document {
  _id: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  content: string;
  chat: mongoose.Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IChatService {
  createChat(
    tenantConnection: mongoose.Connection,
    userId: string,
    currentUserId: string,
    currentUserRole: string
  ): Promise<IChatDocument | null>;
  createGroupChat(
    tenantConnection: mongoose.Connection,
    users: string[],
    name: string,
    adminEmail: string,
    adminRole: string
  ): Promise<IChatDocument | null>;
  getAllChats(
    tenantConnection: mongoose.Connection,
    userId: string
  ): Promise<IChatDocument[]>;
  getCurrentUser(
    tenantConnection: mongoose.Connection,
    email: string
  ): Promise<IEmployee | ICompanyDocument>;
  getChatMessages(
    tenantConnection: mongoose.Connection,
    chatId: string
  ): Promise<IMessageDocument[]>;
}
