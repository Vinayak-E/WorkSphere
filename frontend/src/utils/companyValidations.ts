import { z } from 'zod';

export const companyProfileSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  industry: z.string().optional(),
  businessRegNo: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  zipcode: z.string().optional(),
});

export type CompanyProfileFormData = z.infer<typeof companyProfileSchema>;