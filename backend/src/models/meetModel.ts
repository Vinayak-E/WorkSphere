import mongoose, { Document, Schema } from "mongoose";
import { IMeetModel } from "../interfaces/IMeet.types";


const MeetSchema = new Schema<IMeetModel>(
  {
    meetTitle: {
      type: String,
      required: [true, "Meeting title is required"],
      trim: true,
    },
    meetDate: {
      type: Date,
      required: [true, "Meeting date is required"],
    },
    meetTime: {
      type: String,
      required: [true, "Meeting time is required"],
    },
    isDaily: {
      type: Boolean,
      default: false,
    },
    members: [{
      type: Schema.Types.ObjectId,
      ref: 'Employee',
    }],
    meetId: {
      type: String,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    }
  },
  { timestamps: true }
);

const Meet = mongoose.model<IMeetModel>("Meet", MeetSchema);

export default Meet;