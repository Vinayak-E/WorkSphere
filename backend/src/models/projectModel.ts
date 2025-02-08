import mongoose, {  Schema } from "mongoose";
import { IProject } from "../interfaces/company/IProject.types";

export const projectSchema =  new Schema<IProject>({
    name:{ type : String },
    description:{ type : String },
    isActive :{type :Boolean ,default:true},
    deadline: { type: Date },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" }, 
    employees: [{ type: mongoose.Schema.Types.ObjectId, ref: "Employee" }],
    status: { type: String, enum: ["Pending", "In Progress", "Completed"], default: "Pending" },
    createdAt: { type: Date, default: Date.now },
  });
  
 

const Project = mongoose.model<IProject>("Project", projectSchema);
export default Project;


