import mongoose from "mongoose"
import { Schema } from "mongoose";
import { IEmployee } from "../interfaces/company/IEmployee.types";

export const employeeSchema = new Schema<IEmployee>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: {type:String},
  position:{type :String},
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  gender :{type:String},
  role: { type: String },
  status:{type:String}
},
{
    timestamps: true, 
  });
const Employee = mongoose.model<IEmployee>("Employee", employeeSchema);

export default Employee;

