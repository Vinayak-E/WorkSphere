import { Schema, model, Document } from 'mongoose';

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

const PaymentHistorySchema = new Schema<IPaymentHistory>(
  {
    companyId: { type: String, required: true, index: true },
    tenantId: { type: String, required: true, index: true },
    planId: { type: String, required: true },
    planName: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true, default: 'usd' },
    paymentMethod: { type: String, required: true, default: 'card' },
    stripeSessionId: { type: String, required: true, unique: true },
    stripeInvoiceId: { type: String },
    stripeSubscriptionId: { type: String },
    billingInterval: { type: String, enum: ['monthly', 'yearly'], required: true },
    status: { type: String, enum: ['succeeded', 'failed', 'refunded'], required: true },
    paymentDate: { type: Date, required: true },
  },
  { timestamps: true }
);

export const PaymentHistory = model<IPaymentHistory>('PaymentHistory', PaymentHistorySchema);
export default PaymentHistory;