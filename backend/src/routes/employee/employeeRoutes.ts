import express from 'express';
import { container } from 'tsyringe';
import { JwtService } from '../../services/jwt.service';
import { verifyAuth } from '../../middlewares/authMiddleware';
import { CompanyRepository } from '../../repositories/company/companyRepository';
import { UserRepository } from '../../repositories/user/userRepository';
import { EmployeeController } from '../../controllers/employee/employee.controller';
import { AuthService } from '../../services/company/authentication.service';
import { tenantMiddleware } from '../../middlewares/tenantMiddleware';
import { EmployeeRepository } from '../../repositories/employee/employeeRepository';
import { EmployeeService } from '../../services/employee/employee.service';

import { AttendanceController } from '../../controllers/Implementation/attendance.controller';
import { LeaveController } from '../../controllers/Implementation/leave.controller';
import { ProjectController } from '../../controllers/Implementation/project.controller';
import { TaskController } from '../../controllers/Implementation/task.controller';

const router = express.Router();
const attendanceController = container.resolve<AttendanceController>('AttendanceController');
const leaveController = container.resolve<LeaveController>('LeaveController');
const projectController = container.resolve<ProjectController>('ProjectController');
const taskController = container.resolve<TaskController>('TaskController');


const jwtService = new JwtService();
const userRepository = new UserRepository();
const companyRepository = new CompanyRepository();
const employeeRepository = new EmployeeRepository();

const employeeService = new EmployeeService(employeeRepository, userRepository);
const authService = new AuthService(
  companyRepository,
  userRepository,
  jwtService
);
const employeeController = new EmployeeController(authService, employeeService);

router.post('/changePassword', employeeController.changePassword);

router.use(tenantMiddleware);
router.use(verifyAuth);
router.get('/myProfile', employeeController.getProfile);
router.patch('/updateProfile/:id', employeeController.updateProfile);



router.get('/department', employeeController.getDepartmentEmployees);



//
router.post('/attendance/check-in', attendanceController.checkIn);
router.post('/attendance/check-out', attendanceController.checkOut);
router.get('/attendance/status/:id', attendanceController.getTodayAttendance);

router.get('/leaves', leaveController.getEmployeeLeaves);
router.post('/leaves', leaveController.applyLeave);


router.get('/projects', projectController.getProjects);
router.post('/projects', projectController.createProject);
router.get('/projects/:id', projectController.getProjectById);
router.patch('/projects/:projectId', projectController.updateProject);
router.patch('/projects/:id/status', projectController.updateProjectStatus);


router.post('/projects/:id/tasks', taskController.createTask);
router.get('/tasks', taskController.getEmployeeTasks);
router.patch('/tasks/:id/status', taskController.updateTaskStatus);
router.put('/projects/:projectId/tasks/:taskId',taskController.updateTask);

//
export default router;
