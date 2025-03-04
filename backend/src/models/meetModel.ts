import { Schema } from 'mongoose';
import { IMeetModel } from '../interfaces/IMeet.types'; // Adjust path

export const MeetSchema = new Schema<IMeetModel>(
  {
    meetTitle: {
      type: String,
      required: [true, 'Meeting title is required'],
      trim: true,
    },
    meetDate: {
      type: Date,
      required: [true, 'Meeting date is required'],
    },
    meetTime: {
      type: String,
      required: [true, 'Meeting time is required'],
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Employee',
      },
    ],
    meetId: {
      type: String,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'createdByModel',
    },
    createdByModel: {
      type: String,
      required: true,
      enum: ['Employee', 'Company'],
    },
  },
  { timestamps: true }
);
