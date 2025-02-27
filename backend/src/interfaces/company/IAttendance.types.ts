import mongoose, { Document } from 'mongoose';

export interface IAttendance extends Document {
  _id: string;
  employeeId: mongoose.Types.ObjectId;
  date: Date;
  checkInTime?: Date | null;
  checkOutTime?: Date | null;
  totalWorkedTime?: number;
  checkInStatus: Boolean;
  status: 'Present' | 'Absent' | 'On Leave' | 'Marked' | 'Half Day';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ILeave extends Document {
  _id: string;
  employeeId: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedAt?: Date;
  updatedAt?: Date;
}
