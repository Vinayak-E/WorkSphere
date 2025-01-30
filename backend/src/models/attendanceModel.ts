import mongoose, { Schema } from 'mongoose';
import { IAttendance } from "../interfaces/company/IAttendance.types";

export const attendanceSchema = new Schema<IAttendance>({
  employeeId:  { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
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
  totalHours: {
    type: Number,
    default: 0, 
  },
  status: {
    type: String,
    enum: ["Present", "Absent", "On Leave"],
    default: "Absent", 
  },
  
},  { timestamps: true });


const Attendance = mongoose.model<IAttendance>("Attendance", attendanceSchema);

export default Attendance;

