import { container } from 'tsyringe';
import { MeetService } from '../services/Implementation/meet.service';
import { MeetRepository } from '../repositories/Implementation/meet.repository';
import { MeetController } from '../controllers/Implementation/meet.controller';

export function registerContainer() {
    container.register('MeetRepository', { useClass: MeetRepository });
    container.register('MeetService', { useClass: MeetService });
    container.register('MeetController', { useClass: MeetController });
  }