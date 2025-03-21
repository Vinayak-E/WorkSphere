import { ValidationRules } from "@/types/types";
import * as z from "zod";

export const validateForm = (formState: any): ValidationRules => {
  const errors: ValidationRules = {
    companyName: "",
    email: "",
    phone: "",
    password: "",
    industry: "",
    city: "",
    state: "",
    country: "",
    zipcode: "",
    businessRegNo: "",
    confirmPassword: "",
  };

  if (!formState.companyName.value.trim()) {
    errors.companyName = "Company name is required";
  }

  if (!formState.email.value.trim()) {
    errors.email = "Email is required";
  } else if (!/^\S+@\S+\.\S+$/.test(formState.email.value)) {
    errors.email = "Invalid email format";
  }

  if (!formState.phone.value.trim()) {
    errors.phone = "Phone number is required";
  } else if (!/^\d{10}$/.test(formState.phone.value)) {
    errors.phone = "Invalid phone number";
  }

  if (!formState.industry.value.trim()) {
    errors.industry = "Industry is required";
  }

  if (!formState.businessRegNo.value.trim()) {
    errors.businessRegNo = "Bussiness Registration number is required";
  }
  if (!formState.city.value.trim()) {
    errors.city = "City is required";
  }
  if (!formState.state.value.trim()) {
    errors.state = "State is required";
  }
  if (!formState.country.value.trim()) {
    errors.country = "Country is required";
  }
  if (!formState.zipcode.value.trim()) {
    errors.zipcode = "Zip Code is required";
  } else if (!/^\d{6}$/.test(formState.zipcode.value.trim())) {
    errors.zipcode = "Enter a valid 6 digit Zip Code";
  }

  if (!formState.password.value) {
    errors.password = "Password is required";
  } else if (formState.password.value.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }

  if (formState.confirmPassword.value !== formState.password.value) {
    errors.confirmPassword = "Passwords do not match";
  }

  return errors;
};

export const profileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters"),
  email: z.string().min(2, "Email is required"),
  mobile: z.string().regex(/^[0-9+\-\s]{10}$/, "Invalid mobile number format"),
  dob: z.string().refine((date) => {
    const today = new Date();
    const birthDate = new Date(date);
    const age = today.getFullYear() - birthDate.getFullYear();
    return age >= 18;
  }, "Must be at least 18 years old"),
  profilePicture: z.any().optional(),
  address: z.object({
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    zipCode: z.string().regex(/^\d{5,6}$/, "Invalid zip code"),
    country: z.string().min(2, "Country is required"),
  }),
  qualifications: z.array(
    z.object({
      degree: z.string().min(2, "Degree is required"),
      institution: z.string().min(2, "Institution is required"),
      yearOfCompletion: z
        .string()
        .regex(/^\d{4}$/, "Invalid year")
        .refine((year) => {
          const currentYear = new Date().getFullYear();
          return parseInt(year) <= currentYear;
        }, "Year cannot be in the future"),
    }),
  ),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

export const projectSchema = z.object({
  name: z.string().min(3, "Project name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  status: z.enum(["Pending", "In Progress", "Completed"]).optional(),
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
});

export type ProjectFormData = z.infer<typeof projectSchema>;

export const taskSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Task title must be at least 3 characters" }),
  description: z
    .string()
    .min(5, { message: "Task description must be at least 5 characters" }),
  assignee: z.string().nonempty({ message: "Assignee is required" }),
  deadline: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Invalid date format" })
    .refine(
      (dateString) => {
        const today = new Date(new Date().toISOString().split("T")[0]);
        const deadlineDate = new Date(dateString);
        return deadlineDate >= today;
      },
      { message: "Deadline cannot be in the past" },
    ),
});

export type TaskFormData = z.infer<typeof taskSchema>;
