import mongoose, { Connection, Document } from 'mongoose';
import { IEmployee } from './company/IEmployee.types';
import { ICompanyDocument } from './company/company.types';
import { Model } from 'mongoose';

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

export interface IChatRepository {
  getEmployeeModel(connection: Connection): Model<IEmployee>;
  getCompanyModel(connection: Connection): Model<ICompanyDocument>;

  findExistingChat(
    tenantConnection: mongoose.Connection,
    currentUserId: string,
    userId: string,
    currentUserModel: string,
    otherUserModel: string
  ): Promise<IChatDocument | null>;

  createNewChat(
    tenantConnection: mongoose.Connection,
    chatData: {
      name: string;
      isGroupChat: boolean;
      users: { userId: string; userModel: string }[];
      groupAdmin?: { adminId: string; adminModel: string };
    }
  ): Promise<IChatDocument>;

  findChatById(
    tenantConnection: mongoose.Connection,
    chatId: mongoose.Types.ObjectId | string,
    populateOptions?: string[]
  ): Promise<IChatDocument | null>;

  createMessage(
    tenantConnection: mongoose.Connection,
    messageData: {
      sender: { senderId: string; senderModel: string };
      content: string;
      chat: string;
      mediaUrl: string | null;
      type: string;
    }
  ): Promise<IMessageDocument>;

  updateChatLatestMessage(
    tenantConnection: mongoose.Connection,
    chatId: string,
    messageId: mongoose.Types.ObjectId | string
  ): Promise<void>;

  findMessageById(
    tenantConnection: mongoose.Connection,
    messageId: mongoose.Types.ObjectId | string
  ): Promise<IMessageDocument | null>;

  findUserChats(
    tenantConnection: mongoose.Connection,
    userId: string
  ): Promise<IChatDocument[]>;

  findMessagesForChat(
    tenantConnection: mongoose.Connection,
    chatId: string
  ): Promise<IMessageDocument[]>;

  findByIdAndUpdate(
    tenantConnection: mongoose.Connection,
    messageId: string
  ): Promise<void>;

  addUserToGroup(
    tenantConnection: mongoose.Connection,
    chatId: string,
    user: { userId: string; userModel: string }
  ): Promise<IChatDocument | null>;

  removeUserFromGroup(
    tenantConnection: mongoose.Connection,
    chatId: string,
    userId: string
  ): Promise<IChatDocument | null>;

  getChatMembers(
    tenantConnection: mongoose.Connection,
    chatId: string
  ): Promise<(IEmployee | ICompanyDocument)[]>;
}
