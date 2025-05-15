import express from 'express';
import { container } from 'tsyringe';
import { ChatbotController } from '../../controllers/Implementation/chatbot.controller';

const router = express.Router();
const chatbotController = container.resolve<ChatbotController>('ChatbotController');

router.post('/message', chatbotController.handleMessage);

export default router;