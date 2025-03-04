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

export function registerContainer() {
    container.register('MeetRepository', { useClass: MeetRepository });
    container.register('MeetService', { useClass: MeetService });
    container.register('MeetController', { useClass: MeetController });

    container.register('AttendanceRepository', { useClass: AttendanceRepository });
    container.register('AttendanceService', { useClass: AttendanceService });
    container.register('AttendanceController', { useClass: AttendanceController});

    container.register('LeaveRepository', { useClass: LeaveRepository });
    container.register('LeaveService', { useClass: LeaveService });
    container.register('LeaveController', { useClass: LeaveController});
  }