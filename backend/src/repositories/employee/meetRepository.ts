import mongoose, { Connection } from "mongoose";
import { IMeetModel } from "../../interfaces/IMeet.types";
import { Model } from "mongoose";
import Meet from "../../models/meetModel";


export class MeetRepository {

    private getMeetModel(connection: Connection): Model<IMeetModel> {
        return connection.models.Meet || connection.model<IMeetModel>("Meet", Meet.schema);
    }



    async getMeetings(
        tenantConnection: mongoose.Connection,
        filters: any
    ): Promise<IMeetModel[]> {
        const MeetModel = this.getMeetModel(tenantConnection);
        
        return await MeetModel.find(filters)
            .populate('members', 'name email')
            .populate('createdBy', 'name email')
            .sort({ meetDate: 1, meetTime: 1 });
    }

    async createNewMeet(
        tenantConnection: mongoose.Connection,
        meetData: any
    ): Promise<IMeetModel> {
        const MeetModel = this.getMeetModel(tenantConnection);
        return await MeetModel.create(meetData);
    }
}