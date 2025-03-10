import { Connection } from 'mongoose';
import { IMeetModel } from '../../interfaces/IMeet.types';

export interface IMeetRepository {
  getMeetings(
    tenantConnection: Connection,
    filters: any,
    page: number,
    pageSize: number
  ): Promise<IMeetModel[]>;

  getTotalMeetingsCount(
    tenantConnection: Connection,
    filters: any
  ): Promise<number>;

  create(
    data: Partial<IMeetModel>,
    tenantConnection: Connection
  ): Promise<IMeetModel>;
  update(
    id: string,
    data: Partial<IMeetModel>,
    tenantConnection: Connection,
  ): Promise<IMeetModel | null>;
  delete(id: string,tenantConnection: Connection): Promise<IMeetModel | null>;
}
