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
    tenantConnection: Connection,
    data: Partial<IMeetModel>
  ): Promise<IMeetModel>;
  update(
    tenantConnection: Connection,
    id: string,
    data: Partial<IMeetModel>
  ): Promise<IMeetModel | null>;
  delete(tenantConnection: Connection, id: string): Promise<IMeetModel | null>;
}
