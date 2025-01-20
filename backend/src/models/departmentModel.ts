import mongoose, { Document, Schema } from "mongoose";
import { IDepartment } from "../interfaces/company/IDepartment.types";

export const departmentSchema = new Schema<IDepartment>(

  {
    name: { type: String},
    description: { type: String, },
    status:{type:String}
  },
  {
    timestamps: true, 
  }
);


const Department = mongoose.model<IDepartment>("Department", departmentSchema);

export default Department;


