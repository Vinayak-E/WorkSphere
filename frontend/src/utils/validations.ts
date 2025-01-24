import { ValidationRules } from "@/types/types";


export const validateForm = (formState: any): ValidationRules => {
  const errors: ValidationRules = {
    companyName: "",
    email: "",
    phone: "",
    password: "",
    industry:"",
    city:"",
    state:"",
    country:"", 
    zipcode:"",
    bussinessRegNum:"",
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

  if (!formState.bussinessRegNum.value.trim()) {
    errors.bussinessRegNum = "Bussiness Registration number is required";
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
    errors.zipcode= "Zip Code is required";
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
