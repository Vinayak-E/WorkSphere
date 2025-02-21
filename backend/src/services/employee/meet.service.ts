import mongoose, { Connection, connection } from "mongoose";
import { EmployeeRepository } from "../../repositories/employee/employeeRepository";
import { MeetRepository } from "../../repositories/employee/meetRepository";




export class MeetService {
    constructor(private readonly meetRepository: MeetRepository,private readonly employeeRepository:EmployeeRepository) {}
  

    async getMeetings(tenantConnection:Connection,filters: any, userId: string |mongoose.Types.ObjectId) {

        const userFilter = {
            $or: [
                { createdBy: new mongoose.Types.ObjectId(userId) },  // Meetings created by user
                { members: new mongoose.Types.ObjectId(userId) }     // Meetings where user is a member
            ]
        };

        // Combine with existing filters
        const combinedFilters = {
            ...filters,
            ...userFilter
        };

        return await this.meetRepository.getMeetings(tenantConnection,combinedFilters);
    }

    async createMeeting(tenantConnection:Connection,meetData: any) {
        return await this.meetRepository.createNewMeet(tenantConnection,meetData);
    }

}