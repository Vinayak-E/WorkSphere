import { Document, Types } from 'mongoose';
import mongoose from 'mongoose';

export interface IProject extends Document {
  _id: string;
  name: string;
  isActive: boolean;
  description: string;
  department: mongoose.Types.ObjectId;
  manager: mongoose.Types.ObjectId;
  employees: mongoose.Types.ObjectId[];
  tasks: mongoose.Types.ObjectId[];
  status: 'Pending' | 'In Progress' | 'Completed';
  createdAt?: Date;
  deadline?: Date;

}

export interface ITask extends Document {
  _id: string;
  title: string;
  description: string;
  project: Types.ObjectId;
  assignee: Types.ObjectId;
  status: 'To Do' | 'In Progress' | 'Completed';
  deadline?: Date;
  createdAt?: Date;
}

export interface GetProjectsOptions {
  page: number;
  limit: number;
  search: string;
  employeeId: string;
}

export interface GetCompanyProjectsOptions {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  department?: string;
}


export interface IProjectStats {
  total: number;
  statusChart: { _id: string; count: number }[];
}

export interface ITaskStats {
  total: number;
  statusChart: { _id: string; count: number }[];
  overdue: number;
  dueSoon: number;
}
