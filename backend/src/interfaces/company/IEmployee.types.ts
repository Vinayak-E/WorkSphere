import  {  Document, Types } from 'mongoose';
import { IDepartment } from './IDepartment.types';

export interface IEmployee extends Document {
  _id: string;
  employeeId: string;
  name: string;
  email: string;
  mobile: string;
  position: string;
  role: string;
  gender: string;
  status: string;
  department: IDepartment;
  dob: Date;
  salary: number;
  workMode: 'Remote' | 'On-Site' | 'Hybrid';
  profilePicture: string;

  address: {
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };

  qualifications: {
    degree: string;
    institution: string;
    yearOfCompletion: string;
  }[];

  createdAt: Date;
  updatedAt: Date;
}

export interface IEmployeeStats {
  total: number;
  byDepartment: {
    _id: string | Types.ObjectId;
    name: string;
    count: number;
  }[];
  workload: {
    name: string;
    taskCount: number;
  }[];
}




