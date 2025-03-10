import express from 'express';
import { container } from 'tsyringe';
import { DepartmentController } from '../../controllers/company/departmentController';
import { tenantMiddleware } from '../../middlewares/tenantMiddleware';
import { DepartmentService } from '../../services/company/department.service';
import { DepartmentRepository } from '../../repositories/company/departmentRepository';
import { verifyAuth } from '../../middlewares/authMiddleware';
import { AttendanceController } from '../../controllers/Implementation/attendance.controller';
import { LeaveController } from '../../controllers/Implementation/leave.controller';
import { ProjectController } from '../../controllers/Implementation/project.controller';
import { CompanyController } from '../../controllers/Implementation/company.controller';

const router = express.Router();
const attendanceController = container.resolve<AttendanceController>('AttendanceController');
const leaveController = container.resolve<LeaveController>('LeaveController');
const projectController = container.resolve<ProjectController>('ProjectController');
const companyController = container.resolve<CompanyController>('CompanyController');

const deparmentRepository = new DepartmentRepository();

const departmentService = new DepartmentService(deparmentRepository);
const departmentController = new DepartmentController(departmentService);

router.use(tenantMiddleware);
router.use(verifyAuth);

router.get('/departments', departmentController.getDepartments);
router.post('/departments', departmentController.addDepartment);
router.put('/departments/:id', departmentController.updateDepartment);

//

router.patch('/updateProfile/:id', companyController.updateProfile);

router.get('/employees', companyController.getEmployees);
router.post('/employees', companyController.addEmployee);
router.put('/employees/:id', companyController.updateEmployee);
router.get('/projects', projectController.getAllProjects);
router.get('/attendance', attendanceController.getAllAttendance);

router.get('/leaves', leaveController.getAllLeaves);
router.patch('/leaves/:id', leaveController.updateLeaveStatus);

//
export default router;
