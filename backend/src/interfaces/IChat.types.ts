import mongoose, { Document } from 'mongoose';
import { IEmployee } from './company/IEmployee.types';

export interface IChatDocument extends Document {
    _id: mongoose.Types.ObjectId;
  name: string;
  isGroupChat: boolean;
  users: mongoose.Types.ObjectId[]; 
  latestMessage?:mongoose.Types.ObjectId;
  groupAdmin?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMessageDocument extends Document {
  _id :mongoose.Types.ObjectId
  sender: mongoose.Types.ObjectId;
  content: string;
  chat:  mongoose.Types.ObjectId;
  isRead : boolean
  createdAt: Date;
  updatedAt: Date;
}


export interface IChatService {
    createChat(
        tenantConnection: mongoose.Connection,
        userId: mongoose.Types.ObjectId | string,      
        currentUserEmail: string
      ): Promise<IChatDocument | null>;
    
      createGroupChat(
        tenantConnection: mongoose.Connection,
        users: (mongoose.Types.ObjectId | string)[],
        name: string,
        adminEmail: string
      ): Promise<IChatDocument | null>;
      getAllChats(tenantConnection: mongoose.Connection, userId: string): Promise<IChatDocument[]>
      getCurrentUser(tenantConnection: mongoose.Connection, email: string): Promise<IEmployee>
      getChatMessages(tenantConnection: mongoose.Connection, chatId: string): Promise<IMessageDocument[]>
}
   