import express from 'express';
import { verifyAuth } from '../../middlewares/authMiddleware';
import { tenantMiddleware } from '../../middlewares/tenantMiddleware';
import { MeetController } from '../../controllers/Implementation/meet.controller';
import { container } from 'tsyringe';

const router = express.Router();
const meetController = container.resolve<MeetController>('MeetController');

router.use(tenantMiddleware);
router.use(verifyAuth);

router.get('/', (req, res, next) => meetController.getMeetings(req, res, next));
router.post('/', (req, res, next) => meetController.createMeeting(req, res, next));
router.put('/:id', (req, res, next) => meetController.updateMeeting(req, res, next));
router.delete('/:id', (req, res, next) => meetController.deleteMeeting(req, res, next));

export default router;