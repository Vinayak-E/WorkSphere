import express from "express";
import { DepartmentController } from "../../controllers/Implementation/company/departmentController";
import { tenantMiddleware } from "../../middlewares/tenantMiddleware";
import { DepartmentService } from "../../services/company/department.service";
import { DepartmentRepository } from "../../repositories/company/departmentRepository";
import { ManageEmployeeController } from "../../controllers/Implementation/company/manageEmployeeController";
import { EmployeeService } from "../../services/company/employee.service";
import { EmployeeRepository } from "../../repositories/company/employeeRepository";
import { UserRepository } from "../../repositories/user/userRepository";
import { verifyAuth } from "../../middlewares/authMiddleware";

const router = express.Router();
const deparmentRepository = new DepartmentRepository()
const userRepository = new UserRepository()
const departmentService = new DepartmentService(deparmentRepository)
const departmentController = new DepartmentController(departmentService)
const employeeRepository = new EmployeeRepository()
const employeeService = new EmployeeService(employeeRepository,userRepository)
const employeeController = new ManageEmployeeController(employeeService)

 router.use(tenantMiddleware)
 router.use(verifyAuth)
 router.get("/departments",departmentController.getDepartments);
 router.put('/departments/editDepartment/:id', departmentController.updateDepartment);
 router.get("/employees",employeeController.getEmployees);
 router.post("/addDepartment",departmentController.addDepartment);
 router.post("/addEmployee",employeeController.addEmployee)
 router.put('/employees/editEmployee/:id', employeeController.updateEmployee);

export default router;  