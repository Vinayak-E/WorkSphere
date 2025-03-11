export default interface ISubscription extends Document {
  planName: string;
  description: string;
  price: number;
  planType: "Trial" | "Basic" | "Premium";
  durationInMonths: number;
  features: string[];
  employeeCount: number | null;
  projectCount: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}