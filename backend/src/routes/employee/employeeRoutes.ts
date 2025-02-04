import express from "express";
import { CompanyRepository } from "../../repositories/company/companyRepository";
import { UserRepository } from "../../repositories/user/userRepository";
import { JwtService } from "../../services/jwt.service";
import { EmployeeController } from "../../controllers/employee/employee.controller";
import { AuthService } from "../../services/company/authentication.service";
import { tenantMiddleware } from "../../middlewares/tenantMiddleware";
import { verifyAuth } from "../../middlewares/authMiddleware";
import { EmployeeRepository } from "../../repositories/employee/employeeRepository";
import { EmployeeService } from "../../services/employee/employee.service";
import { ProjectController } from "../../controllers/employee/project.controller";
import { ProjectService } from "../../services/employee/project.service";
import { ProjectRepository } from "../../repositories/employee/projectRepository";

const router = express.Router();
const jwtService  = new JwtService()
const userRepository = new UserRepository();
const companyRepository = new CompanyRepository();
const employeeRepository = new EmployeeRepository()
const projectRepository = new ProjectRepository()
const projectService = new ProjectService(projectRepository,employeeRepository)
const employeeService = new EmployeeService(employeeRepository,userRepository)
const authService = new AuthService(companyRepository,userRepository,jwtService);
const employeeController = new EmployeeController(authService,employeeService);
const projectController = new ProjectController(projectService)


router.post('/changePassword', employeeController.changePassword);

router.use(tenantMiddleware)
router.use(verifyAuth)
router.get('/myProfile', employeeController.getProfile);
router.patch('/updateProfile/:id',employeeController.updateProfile);
router.post('/attendance/check-in',employeeController.checkIn)
router.post('/attendance/check-out',employeeController.checkOut)
router.get('/attendance/status/:id',employeeController.getAttendanceStatus)
router.get('/leaves', employeeController.getLeaves);
router.post('/leaves', employeeController.applyLeave);
router.get('/projects',projectController.getProjects);
router.post('/projects',projectController.createProject);
router.get('/projects/:id',projectController.projectDetails);
router.patch('/projects/:projectId',projectController.editProject);
router.post('/projects/:id/tasks',projectController.addTask); 
router.patch('/projects/:id/status',projectController.updateProjectStatus); 
router.get('/tasks',projectController.getEmployeeTasks)
router.patch('/tasks/:id/status',projectController. updateTaskStatus)

export default router;
