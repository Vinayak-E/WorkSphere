import { Request, Response, NextFunction } from 'express';
import { IChatService } from '../../interfaces/IChat.types';

export class ChatController {
  constructor(private readonly chatService: IChatService) {}

  createChat = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantConnection = req.tenantConnection;
      if (!tenantConnection) {
        res.status(500).json({
          success: false,
          message: 'Tenant connection not established',
        });
        return;
      }

      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const { userId } = req.body;
      const currentUserId = req.userId;

      if (!currentUserId) {
        res.status(400).json({
          success: false,
          message: 'UserId is required',
        });
        return;
      }

      const chat = await this.chatService.createChat(
        tenantConnection,
        userId,
        currentUserId,
        req.user.role
      );

      res.status(200).json({
        success: true,
        message: 'Chat created successfully',
        data: chat,
      });
    } catch (error) {
      next(error);
    }
  };

  createGroupChat = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantConnection = req.tenantConnection;

      if (!tenantConnection) {
        res.status(500).json({
          success: false,
          message: 'Tenant connection not established',
        });
        return;
      }

      const { users, name } = req.body;
      const adminEmail = req.user?.email;

      if (!req.user || !users || !name || !adminEmail) {
        res.status(400).json({
          success: false,
          message: 'Please provide all required fields',
        });
        return;
      }

      const groupChat = await this.chatService.createGroupChat(
        tenantConnection,
        users,
        name,
        adminEmail,
        req.user.role
      );

      res.status(200).json({
        success: true,
        message: 'Group chat created successfully',
        data: groupChat,
      });
    } catch (error) {
      next(error);
    }
  };

  getChats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantConnection = req.tenantConnection;

      if (!tenantConnection) {
        res.status(500).json({
          success: false,
          message: 'Tenant connection not established',
        });
        return;
      }
      if (!req.user?.email) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }
      const currentUser = await this.chatService.getCurrentUser(
        tenantConnection,
        req.user.email
      );

      if (!currentUser) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      const chats = await this.chatService.getAllChats(
        tenantConnection,
        currentUser._id
      );

      res.status(200).json({
        success: true,
        message: 'Chats retrieved successfully',
        data: chats,
      });
    } catch (error) {
      next(error);
    }
  };

  getMessages = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantConnection = req.tenantConnection;
      if (!tenantConnection) {
        res.status(500).json({
          success: false,
          message: 'Tenant connection not established',
        });
        return;
      }

      const chatId = req.params.chatId;
      if (!chatId) {
        res.status(400).json({
          success: false,
          message: 'Chat ID is required',
        });
        return;
      }

      const messages = await this.chatService.getChatMessages(
        tenantConnection,
        chatId
      );
      res.status(200).json({
        success: true,
        message: 'Messages retrieved successfully',
        data: messages,
      });
    } catch (error) {
      next(error);
    }
  };
}
