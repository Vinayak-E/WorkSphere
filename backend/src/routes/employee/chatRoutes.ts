import express from 'express';
import { ChatController } from '../../controllers/chat.controller';
import { ChatService } from '../../services/chat.service';
import { ChatRepository } from '../../repositories/chat.repository';

import { verifyAuth } from '../../middlewares/authMiddleware';
import { tenantMiddleware } from '../../middlewares/tenantMiddleware';
import { EmployeeRepository } from '../../repositories/Implementation/employee.repository';
import mongoose from 'mongoose';

const router = express.Router();
const employeeRepository = new EmployeeRepository(mongoose.connection);
const chatRepository = new ChatRepository();
const chatService = new ChatService(chatRepository, employeeRepository);
const chatController = new ChatController(chatService);
router.use(tenantMiddleware);
router.use(verifyAuth);
router.post('/', chatController.createChat);
router.get('/', chatController.getChats);
router.post('/group', chatController.createGroupChat);
router.get('/:chatId/messages', chatController.getMessages);
export default router;
