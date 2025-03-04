import mongoose, { Schema } from 'mongoose';
import { ILeave } from '../interfaces/company/IAttendance.types';

export const LeaveSchema = new Schema<ILeave>(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    leaveType: {
      type: String,
      enum: ['Full Day', 'Half Day'],
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Leave = mongoose.model<ILeave>('Leave', LeaveSchema);

export default Leave;
