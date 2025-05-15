import mongoose from 'mongoose';
import { container } from 'tsyringe';
import { MeetService } from '../services/Implementation/meet.service';
import { MeetRepository } from '../repositories/Implementation/meet.repository';
import { MeetController } from '../controllers/Implementation/meet.controller';
import { AttendanceRepository } from '../repositories/Implementation/attendance.repository';
import { AttendanceService } from '../services/Implementation/attendance.service';
import { AttendanceController } from '../controllers/Implementation/attendance.controller';
import { LeaveRepository } from '../repositories/Implementation/leave.repository';
import { LeaveService } from '../services/Implementation/leave.service';
import { LeaveController } from '../controllers/Implementation/leave.controller';
import { ProjectRepository } from '../repositories/Implementation/project.repository';
import { ProjectService } from '../services/Implementation/project.service';
import { ProjectController } from '../controllers/Implementation/project.controller';
import { TaskRepository } from '../repositories/Implementation/task.repository';
import { TaskService } from '../services/Implementation/task.service';
import { TaskController } from '../controllers/Implementation/task.controller';
import { AuthController } from '../controllers/Implementation/auth.controller';
import { AuthService } from '../services/Implementation/auth.service';
import { UserRepository } from '../repositories/Implementation/user.repository';
import { EmployeeController } from '../controllers/Implementation/employee.controller';
import { EmployeeService } from '../services/Implementation/employee.service';
import { CompanyRepository } from '../repositories/Implementation/company.repository';
import { EmployeeRepository } from '../repositories/Implementation/employee.repository';
import { CompanyService } from '../services/Implementation/company.service';
import { CompanyController } from '../controllers/Implementation/company.controller';
import { JwtService } from '../services/jwt.service';

import { AdminRepository } from '../repositories/Implementation/admin.repository';
import { AdminService } from '../services/Implementation/admin.service';
import { AdminController } from '../controllers/Implementation/admin.controller';
import { CompanyRequestRepository } from '../repositories/Implementation/companyRequest.repository';
import { DashboardService } from '../services/Implementation/dashboard.service';
import { DashboardController } from '../controllers/Implementation/dashboard.controller';
import { SubscriptionRepository } from '../repositories/Implementation/subscription.repository';
import { SubscriptionService } from '../services/Implementation/subscription.service';
import { SubscriptionController } from '../controllers/Implementation/subscription.controller';
import { CheckoutController } from '../controllers/Implementation/checkout.controller';
import { PaymentRepository } from '../repositories/Implementation/payment.repository';
import { PaymentService } from '../services/Implementation/payment.service';
import { DepartmentRepository } from '../repositories/Implementation/department.repository';
import { DepartmentService } from '../services/Implementation/department.service';
import { DepartmentController } from '../controllers/Implementation/department.controller';
import { ChatbotController } from '../controllers/Implementation/chatbot.controller';

export function registerContainer() {
  console.log('Registering dependencies...');
  
   container.register('MainConnection', { useValue: mongoose.connection });

   container.register('CheckoutController', { useClass: CheckoutController });
   container.register('AuthController', { useClass: AuthController });
   container.register('AuthService', { useClass: AuthService });

   container.register('JwtService', { useClass: JwtService });

   container.register('UserRepository', { useClass: UserRepository });
   container.register('PaymentRepository', { useClass: PaymentRepository });
   container.register('PaymentService', { useClass: PaymentService });
   container.register('CompanyRequestRepository', { useClass: CompanyRequestRepository });


   container.register('DashboardService', { useClass: DashboardService });
   container.register('DashboardController', { useClass: DashboardController });

   container.register('CompanyRepository', { useClass: CompanyRepository });
   container.register('CompanyService', { useClass: CompanyService });
   container.register('CompanyController', { useClass: CompanyController });

    container.register('EmployeeRepository', { useClass: EmployeeRepository });
    container.register('EmployeeService', { useClass: EmployeeService });
    container.register('EmployeeController', { useClass: EmployeeController });

    container.register('MeetRepository', { useClass: MeetRepository });
    container.register('MeetService', { useClass: MeetService });
    container.register('MeetController', { useClass: MeetController });

    container.register('LeaveRepository', { useClass: LeaveRepository });
    container.register('LeaveService', { useClass: LeaveService });
    container.register('LeaveController', { useClass: LeaveController});

    container.register('DepartmentRepository', { useClass: DepartmentRepository });
    container.register('DepartmentService', { useClass: DepartmentService });
    container.register('DepartmentController', { useClass: DepartmentController});

    
    container.register('AttendanceRepository', { useClass: AttendanceRepository });
    container.register('AttendanceService', { useClass: AttendanceService });
    container.register('AttendanceController', { useClass: AttendanceController});

    container.register('ProjectRepository', { useClass: ProjectRepository });
    container.register('ProjectService', { useClass: ProjectService });
    container.register('ProjectController', { useClass: ProjectController});

    container.register('TaskRepository', { useClass: TaskRepository });
    container.register('TaskService', { useClass: TaskService });
    container.register('TaskController', { useClass: TaskController});

    container.register('AdminRepository', { useClass: AdminRepository });
    container.register('AdminService', { useClass: AdminService });
    container.register('AdminController', { useClass: AdminController });

    container.register('SubscriptionRepository', { useClass: SubscriptionRepository });
    container.register('SubscriptionService', { useClass: SubscriptionService });
    container.register('SubscriptionController', { useClass: SubscriptionController });
    
    container.register('ChatbotController', { useClass: ChatbotController });
    
    console.log('Dependencies registered.');
  }