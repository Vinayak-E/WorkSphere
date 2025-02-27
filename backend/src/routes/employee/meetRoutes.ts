import express from 'express';

import { EmployeeRepository } from '../../repositories/employee/employeeRepository';
import { verifyAuth } from '../../middlewares/authMiddleware';
import { tenantMiddleware } from '../../middlewares/tenantMiddleware';
import { MeetController } from '../../controllers/employee/meet.controller';
import { MeetService } from '../../services/employee/meet.service';
import { MeetRepository } from '../../repositories/employee/meetRepository';

const router = express.Router();
const employeeRepository = new EmployeeRepository();
const meetRepository = new MeetRepository();
const meetService = new MeetService(meetRepository, employeeRepository);
const meetController = new MeetController(meetService);
router.use(tenantMiddleware);
router.use(verifyAuth);

router.get('/', meetController.getMeetings);
router.post('/', meetController.createMeeting);
router.put('/:id', meetController.updateMeeting);
router.delete('/:id', meetController.deleteMeeting);

export default router;
