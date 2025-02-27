import mongoose, { Connection, connection } from 'mongoose';
import { EmployeeRepository } from '../../repositories/employee/employeeRepository';
import { MeetRepository } from '../../repositories/employee/meetRepository';
import { generateMeetingId } from '../../helpers/helperFunctions';

export class MeetService {
  constructor(
    private readonly meetRepository: MeetRepository,
    private readonly employeeRepository: EmployeeRepository
  ) {}

  async getMeetings(
    tenantConnection: Connection,
    filters: any,
    userId: string | mongoose.Types.ObjectId,
    page: number,
    pageSize: number
  ) {
    const userFilter = {
      $or: [
        { createdBy: new mongoose.Types.ObjectId(userId) },
        { members: new mongoose.Types.ObjectId(userId) },
      ],
    };

    const combinedFilters = {
      ...filters,
      ...userFilter,
    };

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
    console.log('meetings', meetings);
    return { meetings, total };
  }

  async createMeeting(tenantConnection: Connection, meetData: any) {
    meetData.meetId = generateMeetingId();

    console.log('meetData', meetData);
    return await this.meetRepository.createNewMeet(tenantConnection, meetData);
  }

  async updateMeeting(
    tenantConnection: Connection,
    meetingId: string,
    meetingData: any
  ) {
    console.log('dag', meetingId, meetingData);

    return await this.meetRepository.updateMeet(
      tenantConnection,
      meetingId,
      meetingData
    );
  }

  async deleteMeeting(tenantConnection: Connection, meetingId: string) {
    return await this.meetRepository.deleteMeeting(tenantConnection, meetingId);
  }
}
