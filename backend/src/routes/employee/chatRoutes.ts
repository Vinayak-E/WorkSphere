
import express from 'express';
import { ChatController } from '../../controllers/employee/chat.controller';
import { ChatService } from '../../services/employee/chat.service';
import { ChatRepository } from '../../repositories/employee/chatRepository';
import { EmployeeRepository } from '../../repositories/employee/employeeRepository'; 
import { verifyAuth } from '../../middlewares/authMiddleware';
import { tenantMiddleware } from '../../middlewares/tenantMiddleware';

const router = express.Router();
const employeeRepository = new EmployeeRepository()
const chatRepository = new ChatRepository()
const chatService = new ChatService(chatRepository,employeeRepository);
const chatController = new ChatController(chatService);
router.use(tenantMiddleware)
router.use(verifyAuth)
router.post('/', chatController.createChat);
router.get('/', chatController.getChats);
router.post('/group', chatController.createGroupChat);
router.get('/:chatId/messages', chatController.getMessages);
export default router;