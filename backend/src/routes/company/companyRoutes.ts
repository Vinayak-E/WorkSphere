import express from "express";
import { DepartmentController } from "../../controllers/company/departmentController";
import { tenantMiddleware } from "../../middlewares/tenantMiddleware";
import { DepartmentService } from "../../services/company/department.service";
import { DepartmentRepository } from "../../repositories/company/departmentRepository";
import { ManageEmployeeController } from "../../controllers/company/manageEmployeeController";
import { CompanyService } from "../../services/company/company.service";
import { EmployeeRepository } from "../../repositories/employee/employeeRepository";
import { UserRepository } from "../../repositories/user/userRepository";
import { verifyAuth } from "../../middlewares/authMiddleware";
import { CompanyRepository } from "../../repositories/company/companyRepository";
import { ProjectService } from "../../services/employee/project.service";
import { ProjectRepository } from "../../repositories/employee/projectRepository";
import { ProjectController } from "../../controllers/employee/project.controller";

const router = express.Router();
const deparmentRepository = new DepartmentRepository()
const userRepository = new UserRepository()
const companyRepository = new CompanyRepository()
const departmentService = new DepartmentService(deparmentRepository)
const departmentController = new DepartmentController(departmentService)
const employeeRepository = new EmployeeRepository()
const companyService = new CompanyService(employeeRepository,userRepository,companyRepository)
const employeeController = new ManageEmployeeController(companyService)
const projectRepository = new ProjectRepository()
const projectService = new ProjectService(projectRepository,employeeRepository)
const projectController = new ProjectController(projectService)

 router.use(tenantMiddleware)
 router.use(verifyAuth)
 
 router.get("/departments",departmentController.getDepartments);
 router.post("/departments",departmentController.addDepartment);
 router.put('/departments/:id', departmentController.updateDepartment);
 router.get("/employees",employeeController.getEmployees);
 router.post("/employees",employeeController.addEmployee)
 router.put('/employees/:id', employeeController.updateEmployee);
 router.get('/leaves', employeeController.getLeaveRequests);
 router.patch('/leaves/:id', employeeController.updateLeaveStatus);
 router.get('/attendance', employeeController.getAttendance);
 
 router.get('/projects',projectController.getAllProjects)

export default router;  