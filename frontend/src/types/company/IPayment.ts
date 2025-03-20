export interface PaymentDetails {
    status: string;
    customerEmail?: string;
    amount_total?: number;
    currency?: string;
    payment_intent?: string;
  }