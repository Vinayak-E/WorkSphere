import { Document } from "mongoose";
import ISubscription from "./ISubscription.types";

export interface IPaymentHistory extends Document {
    companyId: string;
    tenantId: string;
    planId: string;
    planName: string;
    amount: number;
    currency: string;
    paymentMethod: string;
    stripeSessionId: string;
    stripeInvoiceId?: string;
    stripeSubscriptionId?: string;
    billingInterval: 'monthly' | 'yearly';
    status: 'succeeded' | 'failed' | 'refunded';
    createdAt: Date;
    paymentDate: Date;
  }
  
  export interface ICompanyCurrentPlan {
    payment: IPaymentHistory;
    plan: ISubscription;
  }

  export interface IRevenueStats {
    totalRevenue: number;
    monthlyRevenue: { month: string; revenue: number }[];
    recentPayments: IPaymentHistory[];
    totalRecentPayments: number;
  }