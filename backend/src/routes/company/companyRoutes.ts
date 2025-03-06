import express from 'express';
import { container } from 'tsyringe';
import { DepartmentController } from '../../controllers/company/departmentController';
import { tenantMiddleware } from '../../middlewares/tenantMiddleware';
import { DepartmentService } from '../../services/company/department.service';
import { DepartmentRepository } from '../../repositories/company/departmentRepository';
import { ManageEmployeeController } from '../../controllers/company/manageEmployeeController';
import { CompanyService } from '../../services/company/company.service';
import { EmployeeRepository } from '../../repositories/employee/employeeRepository';
import { UserRepository } from '../../repositories/user/userRepository';
import { verifyAuth } from '../../middlewares/authMiddleware';
import { CompanyRepository } from '../../repositories/company/companyRepository';


import { CompanyController } from '../../controllers/company/company.controller';
import { AttendanceController } from '../../controllers/Implementation/attendance.controller';
import { LeaveController } from '../../controllers/Implementation/leave.controller';
import { ProjectController } from '../../controllers/Implementation/project.controller';

const router = express.Router();
const attendanceController = container.resolve<AttendanceController>('AttendanceController');
const leaveController = container.resolve<LeaveController>('LeaveController');
const projectController = container.resolve<ProjectController>('ProjectController');

const deparmentRepository = new DepartmentRepository();
const userRepository = new UserRepository();
const companyRepository = new CompanyRepository();
const departmentService = new DepartmentService(deparmentRepository);
const departmentController = new DepartmentController(departmentService);
const employeeRepository = new EmployeeRepository();
const companyService = new CompanyService(
  employeeRepository,
  userRepository,
  companyRepository
);
const employeeController = new ManageEmployeeController(companyService);


const companyController = new CompanyController(companyService);
router.use(tenantMiddleware);
router.use(verifyAuth);

router.get('/departments', departmentController.getDepartments);
router.post('/departments', departmentController.addDepartment);
router.put('/departments/:id', departmentController.updateDepartment);
router.get('/employees', employeeController.getEmployees);
router.post('/employees', employeeController.addEmployee);
router.put('/employees/:id', employeeController.updateEmployee);

router.patch('/updateProfile/:id', companyController.updateProfile);
//

router.get('/projects', projectController.getAllProjects);
router.get('/attendance', attendanceController.getAllAttendance);

router.get('/leaves', leaveController.getAllLeaves);
router.patch('/leaves/:id', leaveController.updateLeaveStatus);

//
export default router;
