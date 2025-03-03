import { Connection } from 'mongoose';
import { IMeetModel } from '../../interfaces/IMeet.types';

export interface IMeetService {
  getMeetings(
    tenantConnection: Connection,
    filters: any,
    userId: string,
    page: number,
    pageSize: number
  ): Promise<{ meetings: IMeetModel[]; total: number }>;

  createMeeting(
    tenantConnection: Connection,
    meetData: Partial<IMeetModel>
  ): Promise<IMeetModel>;

  updateMeeting(
    tenantConnection: Connection,
    meetingId: string,
    meetData: Partial<IMeetModel>
  ): Promise<IMeetModel | null>;

  deleteMeeting(
    tenantConnection: Connection,
    meetingId: string
  ): Promise<IMeetModel | null>;
}
