import { Document, Schema, model } from 'mongoose';
import { IUser } from '../interfaces/IUser.types';

export const UserSchema = new Schema<IUser>(
  {
    companyName: { type: String },
    email: { type: String },
    password: { type: String },
    phone: { type: String },
    role: { type: String, enum: ['ADMIN', 'MANAGER', 'EMPLOYEE', 'COMPANY'] },
    isActive: { type: Boolean, default: true },
    isApproved: { type: String, default: 'Pending' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    resetToken :{type :String },
    resetTokenExpiry:{type:Date}
  },
  { timestamps: true }
);

export const UserModel = model<IUser>('User', UserSchema);
