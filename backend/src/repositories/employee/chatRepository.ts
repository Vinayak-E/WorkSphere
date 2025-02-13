
import mongoose from 'mongoose';
import { IChatDocument, IMessageDocument } from '../../interfaces/IChat.types';
import { getChatModel } from '../../models/chatModel';
import { getMessageModel } from '../../models/messageModel';
import { Connection } from 'mongoose';
import { IEmployee } from '../../interfaces/company/IEmployee.types';
import { Model } from 'mongoose';
import Employee from '../../models/employeeModel';

export class ChatRepository {

    private getEmployeeModel(connection: Connection): Model<IEmployee> {
        return connection.models.Employee || connection.model<IEmployee>("Employee", Employee.schema);
    }

  async findExistingChat(
    tenantConnection: mongoose.Connection,
    currentUserId: string,
    userId: string
  ): Promise<IChatDocument | null> {
    const MessageModel = getMessageModel(tenantConnection);
    const ChatModel = getChatModel(tenantConnection);

    return ChatModel.findOne({
      isGroupChat: false,
      users: {
        $all: [currentUserId, userId],
      },
    })
    .populate("users", "-password")
    .populate("latestMessage");
  }

  async createNewChat(
    tenantConnection: mongoose.Connection,
    chatData: {
      name: string;
      isGroupChat: boolean;
      users: string[];
      groupAdmin?: string;
    }
  ): Promise<IChatDocument> {
    const MessageModel = getMessageModel(tenantConnection);
    const ChatModel = getChatModel(tenantConnection);
    return await ChatModel.create(chatData);
  }

  async findChatById(
    tenantConnection: mongoose.Connection,
    chatId:  mongoose.Types.ObjectId | string,
    populateOptions: string[] = ["users"]
  ): Promise<IChatDocument | null> {
    const MessageModel = getMessageModel(tenantConnection);
    const ChatModel = getChatModel(tenantConnection);
    let query = ChatModel.findOne({ _id: chatId });
    
    populateOptions.forEach(option => {
      if (option === "users") {
        query = query.populate("users", "-password");
      } else if (option === "groupAdmin") {
        query = query.populate("groupAdmin", "-password");
      } else if (option === "latestMessage") {
        query = query.populate("latestMessage");
      }
    });

    return await query;
  }

  async createMessage(
    tenantConnection: mongoose.Connection,
    messageData: {
      sender: string;
      content: string;
      chat: string;
    }
  ): Promise<IMessageDocument> {
    const EmployeeModel = this.getEmployeeModel(tenantConnection);
    const MessageModel = getMessageModel(tenantConnection);
    return await MessageModel.create(messageData);
  }

  async updateChatLatestMessage(
    tenantConnection: mongoose.Connection,
    chatId: string,
    messageId: mongoose.Types.ObjectId | string 
  ): Promise<void> {
    const ChatModel = getChatModel(tenantConnection);
    await ChatModel.findByIdAndUpdate(chatId, {
      latestMessage: messageId,
    });
  }

  async findMessageById(
    tenantConnection: mongoose.Connection,
    messageId: mongoose.Types.ObjectId | string 
  ): Promise<IMessageDocument | null> {
    const MessageModel = getMessageModel(tenantConnection);
    return await MessageModel.findById(messageId)
      .populate("sender", "name profilePic")
      .populate("chat");
  }

  async findUserChats(
    tenantConnection: mongoose.Connection,
    userId: string
  ): Promise<IChatDocument[]> {
    const MessageModel = getMessageModel(tenantConnection);
    const ChatModel = getChatModel(tenantConnection);
    return await ChatModel.find({ 
      users: { $elemMatch: { $eq: userId } } 
    })
    .populate("users", "-password")
    .populate("groupAdmin", "-password")
    .populate("latestMessage")
    .sort({ updatedAt: -1 });
  }

  async findMessagesForChat(
    tenantConnection: mongoose.Connection,
    chatId: string
  ): Promise<IMessageDocument[]> {
    const MessageModel: Model<IMessageDocument> = getMessageModel(tenantConnection);
    const ChatModel = getChatModel(tenantConnection);
    const EmployeeModel = this.getEmployeeModel(tenantConnection);
    return await MessageModel.find({ chat: chatId })
      .populate("sender", "name profilePic")
      .populate("chat")
      .sort({ createdAt: 1 }); // Sorting by creation time (oldest first)
  }
}