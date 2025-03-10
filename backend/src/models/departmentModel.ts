import mongoose, { Document, Schema } from 'mongoose';
import { IDepartment } from '../interfaces/company/IDepartment.types';

export const DepartmentSchema = new Schema<IDepartment>(
  {
    departmentId: { type: String },
    name: { type: String },
    description: { type: String },
    status: { type: String },
  },
  {
    timestamps: true,
  }
);

const Department = mongoose.model<IDepartment>('Department', DepartmentSchema);

export default Department;
