import { Connection } from 'mongoose';
import { injectable, inject } from 'tsyringe';
import { IMeetService } from '../Interface/IMeetService';
import { IMeetModel } from '../../interfaces/IMeet.types';
import { generateMeetingId } from '../../helpers/helperFunctions';
import { IMeetRepository } from '../../repositories/Interface/IMeetRepository';

@injectable()
export class MeetService implements IMeetService {
  constructor(
    @inject('MeetRepository') private meetRepository: IMeetRepository
  ) {}

  async getMeetings(
    tenantConnection: Connection,
    filters: any,
    userId: string,
    page: number,
    pageSize: number
  ) {
    const userFilter = {
      $or: [{ createdBy: userId }, { members: userId }],
    };
    const combinedFilters = { ...filters, ...userFilter };

    const [meetings, total] = await Promise.all([
      this.meetRepository.getMeetings(
        tenantConnection,
        combinedFilters,
        page,
        pageSize
      ),
      this.meetRepository.getTotalMeetingsCount(
        tenantConnection,
        combinedFilters
      ),
    ]);

    return { meetings, total };
  }

  async createMeeting(
    tenantConnection: Connection,
    meetData: Partial<IMeetModel>
  ) {
    meetData.meetId = generateMeetingId();
    return await this.meetRepository.create(tenantConnection, meetData);
  }

  async updateMeeting(
    tenantConnection: Connection,
    meetingId: string,
    meetData: Partial<IMeetModel>
  ) {
    return await this.meetRepository.update(
      tenantConnection,
      meetingId,
      meetData
    );
  }

  async deleteMeeting(tenantConnection: Connection, meetingId: string) {
    return await this.meetRepository.delete(tenantConnection, meetingId);
  }
}
