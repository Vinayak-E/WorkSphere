
import express from 'express';

import { EmployeeRepository } from '../../repositories/employee/employeeRepository'; 
import { verifyAuth } from '../../middlewares/authMiddleware';
import { tenantMiddleware } from '../../middlewares/tenantMiddleware';
import { MeetController } from '../../controllers/employee/meet.controller';

const router = express.Router();
const employeeRepository = new EmployeeRepository()

router.use(tenantMiddleware)
router.use(verifyAuth)

export default router;