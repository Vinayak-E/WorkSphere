import mongoose from "mongoose";
import { Schema } from "mongoose";
import { IEmployee } from "../interfaces/company/IEmployee.types";

export const employeeSchema = new Schema<IEmployee>({
  employeeId: { type: String },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String },
  position: { type: String },
  department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  gender: { type: String },
  role: { type: String },
  status: { type: String },
  dob: { type: Date, required: true },
  salary: { type: Number, required: true }, 
  workMode: { type: String, enum: ["Remote", "On-Site", "Hybrid"], required: true }, 
  profilePicture: { type: String },
  address: {  
    city: { type: String },
    state: { type: String },
    zipCode: { type: String },
    country: { type: String },
  }, 
  qualifications: [
    {
      degree: { type: String },
      institution: { type: String },
      yearOfCompletion: { type: String },
    },
  ], 
}, {
  timestamps: true,
});

const Employee = mongoose.model<IEmployee>("Employee", employeeSchema);

export default Employee;
