import { Messages } from '../constants/messages';
import { HttpStatus } from '../constants/httpStatus';
import { IChatService } from '../interfaces/IChat.types';
import { Request, Response, NextFunction } from 'express';

export class ChatController {
  constructor(private readonly chatService: IChatService) {}

  createChat = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantConnection = req.tenantConnection;
      if (!tenantConnection) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: Messages.TENANT_CONNECTION_ERROR,
        });
        return;
      }

      if (!req.user) {
        res.status(HttpStatus.UNAUTHORIZED).json({
          success: false,
          message: Messages.UNAUTHORIZED_ACCESS,
        });
        return;
      }

      const { userId } = req.body;
      const currentUserId = req.userId;

      if (!currentUserId) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: Messages.USER_ID_NOT_FOUND,
        });
        return;
      }

      const chat = await this.chatService.createChat(
        tenantConnection,
        userId,
        currentUserId,
        req.user.role
      );

      res.status(HttpStatus.OK).json({
        success: true,
        message: Messages.CHAT_CREATE_SUCCESS,
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
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: Messages.TENANT_CONNECTION_ERROR,
        });
        return;
      }

      const { users, name } = req.body;
      const adminEmail = req.user?.email;

      if (!req.user || !users || !name || !adminEmail) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: Messages.MISSING_FIELDS,
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

      res.status(HttpStatus.OK).json({
        success: true,
        message: Messages.CHAT_CREATE_SUCCESS,
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
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: Messages.TENANT_CONNECTION_ERROR,
        });
        return;
      }
      if (!req.user?.email) {
        res.status(HttpStatus.UNAUTHORIZED).json({
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
        res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: Messages.USER_NOT_FOUND,
        });
        return;
      }

      const chats = await this.chatService.getAllChats(
        tenantConnection,
        currentUser._id
      );

      res.status(HttpStatus.OK).json({
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
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: Messages.TENANT_CONNECTION_ERROR,
        });
        return;
      }

      const chatId = req.params.chatId;
      if (!chatId) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'Chat ID is required',
        });
        return;
      }

      const messages = await this.chatService.getChatMessages(
        tenantConnection,
        chatId
      );
      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Messages retrieved successfully',
        data: messages,
      });
    } catch (error) {
      next(error);
    }
  };
}
