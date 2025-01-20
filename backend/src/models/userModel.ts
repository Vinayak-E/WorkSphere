import { Document, Schema, model } from "mongoose";
import { IUser } from "../interfaces/IUser.types";

const UserSchema = new Schema<IUser>(
  {
    companyName: { type: String,},
    email: { type: String, },
    password: { type: String,},
    phone: { type: String },
    role: { type: String, enum: ["ADMIN", "MANAGER", "EMPLOYEE","COMPANY"] },
    isActive: { type: Boolean, default: true },
    isApproved: { type: String, default: 'Pending' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);


export const UserModel = model<IUser>("User", UserSchema); 
