import mongoose from 'mongoose';
import { IChatDocument, IMessageDocument } from '../../interfaces/IChat.types';
import { ChatRepository } from '../../repositories/employee/chatRepository';
import { EmployeeRepository } from '../../repositories/employee/employeeRepository';
import { IEmployee } from '../../interfaces/company/IEmployee.types';
import { ICompanyDocument } from '../../interfaces/company/company.types';
export class ChatService {
  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly employeeRepository: EmployeeRepository
  ) {}

  private determineUserModel(role: string): 'Employee' | 'Company' {
    return role === 'COMPANY' ? 'Company' : 'Employee';
  }

  private async getUserModelById(
    tenantConnection: mongoose.Connection,
    userId: string
  ): Promise<'Employee' | 'Company'> {
    const employeeModel =
      this.chatRepository.getEmployeeModel(tenantConnection);
    const companyModel = this.chatRepository.getCompanyModel(tenantConnection);
    const employee = await employeeModel.findById(userId);
    if (employee) return 'Employee';
    const company = await companyModel.findById(userId);
    if (company) return 'Company';
    throw new Error('User not found');
  }

  async createChat(
    tenantConnection: mongoose.Connection,
    userId: string,
    currentUserId: string,
    currentUserRole: string
  ): Promise<IChatDocument | null> {
    const currentUserModel = this.determineUserModel(currentUserRole);
    const otherUserModel = await this.getUserModelById(
      tenantConnection,
      userId
    );

    const existingChat = await this.chatRepository.findExistingChat(
      tenantConnection,
      currentUserId,
      userId,
      currentUserModel,
      otherUserModel
    );

    if (existingChat) return existingChat;

    const chatData = {
      name: 'sender',
      isGroupChat: false,
      users: [
        { userId: currentUserId, userModel: currentUserModel },
        { userId, userModel: otherUserModel },
      ],
    };

    const createdChat = await this.chatRepository.createNewChat(
      tenantConnection,
      chatData
    );

    return await this.chatRepository.findChatById(
      tenantConnection,
      createdChat._id,
      ['users.userId']
    );
  }

  async createGroupChat(
    tenantConnection: mongoose.Connection,
    users: string[],
    name: string,
    adminEmail: string,
    adminRole: string
  ): Promise<IChatDocument | null> {
    const admin = await this.employeeRepository.getEmployeeByEmail(
      tenantConnection,
      adminEmail
    );
    if (!admin) throw new Error('Admin not found');
    const adminId = admin._id;
    const adminModel = this.determineUserModel(adminRole);

    const usersWithModels = await Promise.all(
      users.map(async (userId) => ({
        userId,
        userModel: await this.getUserModelById(tenantConnection, userId),
      }))
    );

    const groupChat = await this.chatRepository.createNewChat(
      tenantConnection,
      {
        name,
        users: usersWithModels,
        isGroupChat: true,
        groupAdmin: { adminId, adminModel },
      }
    );

    return await this.chatRepository.findChatById(
      tenantConnection,
      groupChat._id,
      ['users.userId', 'groupAdmin.adminId']
    );
  }

  async sendMessage(
    tenantConnection: mongoose.Connection,
    content: string,
    chatId: string,
    senderId: string,
    senderRole: string,
    mediaUrl?: string,
    type?: string
  ): Promise<IMessageDocument> {
    console.log('senderrole', senderRole);
    const senderModel = this.determineUserModel(senderRole);
    console.log('senderModel', senderModel);
    const newMessage = await this.chatRepository.createMessage(
      tenantConnection,
      {
        sender: { senderId, senderModel },
        content,
        chat: chatId,
        mediaUrl: mediaUrl || null,
        type: type || 'text',
      }
    );

    await this.chatRepository.updateChatLatestMessage(
      tenantConnection,
      chatId,
      newMessage._id
    );

    const message = await this.chatRepository.findMessageById(
      tenantConnection,
      newMessage._id
    );
    if (!message) throw new Error('Message not found after creation');

    return message;
  }

  async getCurrentUser(
    tenantConnection: mongoose.Connection,
    email: string
  ): Promise<IEmployee | ICompanyDocument> {
    const employee = await this.employeeRepository.getEmployeeByEmail(
      tenantConnection,
      email
    );
    if (employee) return employee;
    const companyModel = this.chatRepository.getCompanyModel(tenantConnection);
    const company = await companyModel.findOne({ email });
    if (company) return company;
    throw new Error('User not found');
  }

  async getAllChats(
    tenantConnection: mongoose.Connection,
    userId: string
  ): Promise<IChatDocument[]> {
    if (!userId) throw new Error('User ID is required');
    const chats = await this.chatRepository.findUserChats(
      tenantConnection,
      userId
    );
    if (!chats) throw new Error('Error retrieving chats');
    return chats;
  }

  async getChatMessages(
    tenantConnection: mongoose.Connection,
    chatId: string
  ): Promise<IMessageDocument[]> {
    return await this.chatRepository.findMessagesForChat(
      tenantConnection,
      chatId
    );
  }

  async markMessageAsRead(
    tenantConnection: mongoose.Connection,
    messageId: string,
    readerId: string
  ): Promise<void> {
    await this.chatRepository.findByIdAndUpdate(tenantConnection, messageId);
  }

  async addToGroup(
    tenantConnection: mongoose.Connection,
    chatId: string,
    userId: string
  ): Promise<IChatDocument | null> {
    const userModel = await this.getUserModelById(tenantConnection, userId);
    const updatedChat = await this.chatRepository.addUserToGroup(
      tenantConnection,
      chatId,
      { userId, userModel }
    );
    if (!updatedChat) throw new Error('Chat not found or update failed');

    return await this.chatRepository.findChatById(
      tenantConnection,
      updatedChat._id,
      ['users.userId', 'groupAdmin.adminId']
    );
  }

  async removeFromGroup(
    tenantConnection: mongoose.Connection,
    chatId: string,
    userId: string
  ): Promise<IChatDocument | null> {
    const updatedChat = await this.chatRepository.removeUserFromGroup(
      tenantConnection,
      chatId,
      userId
    );
    if (!updatedChat) throw new Error('Chat not found or update failed');

    return await this.chatRepository.findChatById(
      tenantConnection,
      updatedChat._id,
      ['users.userId', 'groupAdmin.adminId']
    );
  }

  async getChatMembers(
    tenantConnection: mongoose.Connection,
    chatId: string
  ): Promise<(IEmployee | ICompanyDocument)[]> {
    return await this.chatRepository.getChatMembers(tenantConnection, chatId);
  }
}
