import mongoose, { Schema } from 'mongoose';
import { IAttendance } from '../interfaces/company/IAttendance.types';

export const attendanceSchema = new Schema<IAttendance>(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    date: {
      type: Date,
      default: Date.now,
    },
    checkInTime: {
      type: Date,
      default: null,
    },
    checkOutTime: {
      type: Date,
      default: null,
    },
    totalWorkedTime: {
      type: Number,
      default: 0,
    },
    checkInStatus: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'On Leave', 'Marked', 'Half Day Leave'],
      default: 'Absent',
    },
  },
  { timestamps: true }
);

const Attendance = mongoose.model<IAttendance>('Attendance', attendanceSchema);

export default Attendance;
