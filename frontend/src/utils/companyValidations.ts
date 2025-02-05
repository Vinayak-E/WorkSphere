import { z } from 'zod';

export const companyProfileSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^[0-9+\-\s]{10}$/, 'Invalid mobile number format'),
  industry: z.string().min(2, 'Industry is required'),
  businessRegNo: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  country: z.string().min(2, 'Country is required'),
  zipcode: z.string().regex(/^\d{5,6}$/, 'Invalid zip code')
});

export type CompanyProfileFormData = z.infer<typeof companyProfileSchema>;