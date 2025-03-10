import express from 'express';
import { container } from 'tsyringe';
import { verifyAuth } from '../../middlewares/authMiddleware';
import { tenantMiddleware } from '../../middlewares/tenantMiddleware';
import { TaskController } from '../../controllers/Implementation/task.controller';
import { LeaveController } from '../../controllers/Implementation/leave.controller';
import { ProjectController } from '../../controllers/Implementation/project.controller';
import { EmployeeController } from '../../controllers/Implementation/employee.controller';
import { AttendanceController } from '../../controllers/Implementation/attendance.controller';

const router = express.Router();
const leaveController = container.resolve<LeaveController>('LeaveController');
const attendanceController = container.resolve<AttendanceController>('AttendanceController');
const projectController = container.resolve<ProjectController>('ProjectController');
const taskController = container.resolve<TaskController>('TaskController');
const employeeController = container.resolve<EmployeeController>('EmployeeController');




router.post('/changePassword', employeeController.changePassword);
router.use(tenantMiddleware);
router.use(verifyAuth);
router.get('/myProfile', employeeController.getProfile);
router.patch('/updateProfile/:id', employeeController.updateProfile);
router.get('/department', employeeController.getDepartmentEmployees);

router.get('/leaves', leaveController.getEmployeeLeaves);
router.post('/leaves', leaveController.applyLeave);

router.post('/attendance/check-in', attendanceController.checkIn);
router.post('/attendance/check-out', attendanceController.checkOut);
router.get('/attendance/status/:id', attendanceController.getTodayAttendance);

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
