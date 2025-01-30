import express from "express";
import { DepartmentController } from "../../controllers/company/departmentController";
import { tenantMiddleware } from "../../middlewares/tenantMiddleware";
import { DepartmentService } from "../../services/company/department.service";
import { DepartmentRepository } from "../../repositories/company/departmentRepository";
import { ManageEmployeeController } from "../../controllers/company/manageEmployeeController";
import { CompanyService } from "../../services/company/company.service";
import { EmployeeRepository } from "../../repositories/company/employeeRepository";
import { UserRepository } from "../../repositories/user/userRepository";
import { verifyAuth } from "../../middlewares/authMiddleware";

const router = express.Router();
const deparmentRepository = new DepartmentRepository()
const userRepository = new UserRepository()
const departmentService = new DepartmentService(deparmentRepository)
const departmentController = new DepartmentController(departmentService)
const employeeRepository = new EmployeeRepository()
const companyService = new CompanyService(employeeRepository,userRepository)
const employeeController = new ManageEmployeeController(companyService)

 router.use(tenantMiddleware)
 router.use(verifyAuth)
 
 router.get("/departments",departmentController.getDepartments);
 router.post("/departments",departmentController.addDepartment);
 router.put('/departments/:id', departmentController.updateDepartment);
 router.get("/employees",employeeController.getEmployees);
 router.post("/employees",employeeController.addEmployee)
 router.put('/employees/:id', employeeController.updateEmployee);

export default router;  