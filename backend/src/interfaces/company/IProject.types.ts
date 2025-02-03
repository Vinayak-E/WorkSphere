import { Connection, Types } from "mongoose";

export interface IProject  extends Document {
  _id?: Types.ObjectId;
  name: string;
  isActive: boolean;
  description: string;
  department: Types.ObjectId; 
  manager: Types.ObjectId; 
  employees: Types.ObjectId[]; 
  tasks: Types.ObjectId[]; 
  status: "Pending" | "In Progress" | "Completed";
  createdAt?: Date;
  deadline?: Date;                              
}



export interface ITask extends Document {
  _id?: Types.ObjectId;
  title: string;
  description: string;
  project: Types.ObjectId;
  assignee: Types.ObjectId; 
  priority: "Low" | "Medium" | "High";
  status: "To Do" | "In Progress" | "Completed";
  deadline?: Date;
  createdAt?: Date;
}


export interface IProjectService{
  getManagerProjects(connection: Connection, id: string): Promise<IProject[]>
  createProject(connection: Connection, projectData: IProject): Promise<IProject>
  getProjectDetails(connection: Connection, projectId: string): Promise<IProject | null>
  addTask(connection: Connection, taskData: ITask): Promise<ITask>
}