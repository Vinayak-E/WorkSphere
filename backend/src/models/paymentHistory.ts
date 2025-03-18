import { Schema, model} from 'mongoose';
import { IPaymentHistory } from '../interfaces/IPayment.types';

export const PaymentHistorySchema = new Schema<IPaymentHistory>(
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