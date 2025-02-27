import mongoose from 'mongoose';
import { IChatDocument, IMessageDocument } from '../../interfaces/IChat.types';
import { getChatModel } from '../../models/chatModel';
import { getMessageModel } from '../../models/messageModel';
import { Connection, Model } from 'mongoose';
import { IEmployee } from '../../interfaces/company/IEmployee.types';
import Employee from '../../models/employeeModel';
import { ICompanyDocument } from '../../interfaces/company/company.types';
import Company from '../../models/companyModel';

export class ChatRepository {
  getEmployeeModel(connection: Connection): Model<IEmployee> {
    return connection.models.Employee || connection.model<IEmployee>('Employee', Employee.schema);
  }

  getCompanyModel(connection: Connection): Model<ICompanyDocument> {
    return connection.models.Company || connection.model<ICompanyDocument>('Company', Company.schema);
  }

  async findExistingChat(
    tenantConnection: mongoose.Connection,
    currentUserId: string,
    userId: string,
    currentUserModel: string,
    otherUserModel: string
  ): Promise<IChatDocument | null> {
    const ChatModel = getChatModel(tenantConnection);
    const MessageModel = getMessageModel(tenantConnection);
    const EmployeeModel = this.getEmployeeModel(tenantConnection)
    const CompanyModel =this.getCompanyModel(tenantConnection)
    return ChatModel.findOne({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { userId: currentUserId, userModel: currentUserModel } } },
        { users: { $elemMatch: { userId, userModel: otherUserModel } } },
      ],
    })
      .populate('users.userId', '-password')
      .populate('latestMessage');
  }

  async createNewChat(
    tenantConnection: mongoose.Connection,
    chatData: {
      name: string;
      isGroupChat: boolean;
      users: { userId: string; userModel: string }[];
      groupAdmin?: { adminId: string; adminModel: string };
    }
  ): Promise<IChatDocument> {
    const ChatModel = getChatModel(tenantConnection);
    return await ChatModel.create(chatData);
  }

  async findChatById(
    tenantConnection: mongoose.Connection,
    chatId: mongoose.Types.ObjectId | string,
    populateOptions: string[] = ['users.userId']
  ): Promise<IChatDocument | null> {
    const ChatModel = getChatModel(tenantConnection);
    const MessageModel = getMessageModel(tenantConnection);
    const CompanyModel =this.getCompanyModel(tenantConnection)
    let query = ChatModel.findOne({ _id: chatId });

    populateOptions.forEach((option) => {
      if (option === 'users.userId') {
        query = query.populate('users.userId', '-password');
      } else if (option === 'groupAdmin.adminId') {
        query = query.populate('groupAdmin.adminId', '-password');
      } else if (option === 'latestMessage') {
        query = query.populate('latestMessage');
      }
    });

    return await query;
  }

  async createMessage(
    tenantConnection: mongoose.Connection,
    messageData: {
      sender: { senderId: string; senderModel: string };
      content: string;
      chat: string;
      mediaUrl: string | null;
      type: string;
    }
  ): Promise<IMessageDocument> {
    const MessageModel = getMessageModel(tenantConnection);
    const EmployeeModel = this.getEmployeeModel(tenantConnection);
    
    return await MessageModel.create(messageData);
  }

  async updateChatLatestMessage(
    tenantConnection: mongoose.Connection,
    chatId: string,
    messageId: mongoose.Types.ObjectId | string
  ): Promise<void> {
    const ChatModel = getChatModel(tenantConnection);
    const MessageModel = getMessageModel(tenantConnection);
    await ChatModel.findByIdAndUpdate(chatId, { latestMessage: messageId });
  }

  async findMessageById(
    tenantConnection: mongoose.Connection,
    messageId: mongoose.Types.ObjectId | string
  ): Promise<IMessageDocument | null> {
    const MessageModel = getMessageModel(tenantConnection);
    const ChatModel = getChatModel(tenantConnection);
    const EmployeeModel = this.getEmployeeModel(tenantConnection)
    const CompanyModel =this.getCompanyModel(tenantConnection)
    return await MessageModel.findById(messageId)
      .populate('sender.senderId', 'name profilePic')
      .populate('chat');
  }

  async findUserChats(
    tenantConnection: mongoose.Connection,
    userId: string
  ): Promise<IChatDocument[]> {
    const ChatModel = getChatModel(tenantConnection);
    const MessageModel = getMessageModel(tenantConnection);
    const EmployeeModel = this.getEmployeeModel(tenantConnection)
    const CompanyModel =this.getCompanyModel(tenantConnection)
    return await ChatModel.find({ 'users.userId': userId })
      .populate('users.userId', '-password')
      .populate('groupAdmin.adminId', '-password')
      .populate('latestMessage')
      .sort({ updatedAt: -1 });
  }

  async findMessagesForChat(
    tenantConnection: mongoose.Connection,
    chatId: string
  ): Promise<IMessageDocument[]> {
    const MessageModel = getMessageModel(tenantConnection);
    const ChatModel = getChatModel(tenantConnection);
    const EmployeeModel = this.getEmployeeModel(tenantConnection)
    const CompanyModel =this.getCompanyModel(tenantConnection)
    return await MessageModel.find({ chat: chatId })
      .populate('sender.senderId', 'name profilePic')
      .populate('chat')
      .sort({ createdAt: 1 });
  }

  async findByIdAndUpdate(
    tenantConnection: mongoose.Connection,
    messageId: string
  ): Promise<void> {
    const MessageModel = getMessageModel(tenantConnection);
    await MessageModel.findByIdAndUpdate(messageId, { isRead: true }, { new: true });
  }

  async addUserToGroup(
    tenantConnection: mongoose.Connection,
    chatId: string,
    user: { userId: string; userModel: string }
  ): Promise<IChatDocument | null> {
    const ChatModel = getChatModel(tenantConnection);
      const EmployeeModel = this.getEmployeeModel(tenantConnection)
      const CompanyModel =this.getCompanyModel(tenantConnection)
    return await ChatModel.findByIdAndUpdate(
      chatId,
      { $addToSet: { users: { userId: user.userId, userModel: user.userModel } } },
      { new: true }
    )
      .populate('users.userId', '-password')
      .populate('groupAdmin.adminId', '-password');
  }

  async removeUserFromGroup(
    tenantConnection: mongoose.Connection,
    chatId: string,
    userId: string
  ): Promise<IChatDocument | null> {
    const ChatModel = getChatModel(tenantConnection);
    const EmployeeModel = this.getEmployeeModel(tenantConnection)
    const CompanyModel =this.getCompanyModel(tenantConnection)
    return await ChatModel.findByIdAndUpdate(
      chatId,
      { $pull: { users: { userId } } },
      { new: true }
    )
      .populate('users.userId', '-password')
      .populate('groupAdmin.adminId', '-password');
  }

  async getChatMembers(
    tenantConnection: mongoose.Connection,
    chatId: string
  ): Promise<(IEmployee | ICompanyDocument)[]> {
    const ChatModel = getChatModel(tenantConnection);
    const EmployeeModel = this.getEmployeeModel(tenantConnection)
    const CompanyModel =this.getCompanyModel(tenantConnection)
    const chat = await ChatModel.findById(chatId).populate<{
      users: { userId: IEmployee | ICompanyDocument; userModel: string }[]
    }>('users.userId', '-password');
    if (!chat) throw new Error('Chat not found');
    return chat.users.map((user) => user.userId);
  }
}