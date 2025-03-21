import express from 'express';
import { container } from 'tsyringe';
import { verifyAuth } from '../../middlewares/authMiddleware';
import { tenantMiddleware } from '../../middlewares/tenantMiddleware';
import { MeetController } from '../../controllers/Implementation/meet.controller';

const router = express.Router();
const meetController = container.resolve<MeetController>('MeetController');

router.use(tenantMiddleware);
router.use(verifyAuth);

router.get('/', meetController.getMeetings);
router.post('/',  meetController.createMeeting);
router.put('/:id', meetController.updateMeeting);
router.delete('/:id', meetController.deleteMeeting);

export default router;