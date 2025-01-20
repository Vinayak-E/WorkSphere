import mongoose from "mongoose";

export interface IEmployee extends Document {
    _id :string
    name: string;         
    email: string;
    mobile:string;
    position:string;
    role :string;
    gender:string;
    status:string
    department: mongoose.Schema.Types.ObjectId; 
    createdAt: Date;      
    updatedAt: Date;     
  }

  export interface ICreateEmployee {
    name: string;         
    email: string;
    mobile:string;
    position:string;
    status :string;
    gender:string;
    department: mongoose.Schema.Types.ObjectId; 
  
  }
  

  export interface IUpdateEmployee {
    name?: string;
    email:string
    mobile?: string;
    position?:string;
    gender?: string;
    department?:mongoose.Schema.Types.ObjectId; 
    status?: string;
  }