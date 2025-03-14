import { Schema } from 'mongoose';
import ISubscription from '../interfaces/ISubscription.types';

export const subscriptionPlanSchema: Schema<ISubscription> = new Schema(
  {
    planName: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    planType: {
      type: String,
      required: true,
      enum: ["Trial", "Basic", "Premium"],
    },
    durationInMonths: {
      type: Number,
      required: true,
    },
    features: {
      type: [String],
      default: [],
    },
    employeeCount: {
      type: Number,
      default: null,
    },
    projectCount: {
      type: Number,
      default: null,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  { timestamps: true }
);