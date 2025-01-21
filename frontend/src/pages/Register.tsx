import { useState, FormEvent } from "react";
import IMAGES from "../assets/images/image";
import { useNavigate } from "react-router-dom";
import { handleSignup } from "../controllers/authController";
import { validateForm } from "@/utils/validations";
import { FormState,FieldState,FieldName } from "@/types/types";
import { toast } from 'react-toastify';

const Register = () => {
  const [formState, setFormState] = useState<FormState>({
    companyName: { value: "", error: "", touched: false, isValid: false },
    email: { value: "", error: "", touched: false, isValid: false },
    phone: { value: "", error: "", touched: false, isValid: false },
    password: { value: "", error: "", touched: false, isValid: false },
    confirmPassword: { value: "", error: "", touched: false, isValid: false },
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (name: FieldName) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({
      ...prev,
      [name]: { ...prev[name], value: e.target.value, touched: true },
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errors = validateForm(formState);

    let isValid = true;
    const updatedFormState = { ...formState };

    (Object.keys(errors) as FieldName[]).forEach((key) => {
      updatedFormState[key].error = errors[key];
      updatedFormState[key].isValid = !errors[key];
      if (errors[key]) isValid = false;
    });

    setFormState(updatedFormState);
    if (isValid) {
      try {
        await handleSignup(formState, navigate, setErrorMessage, setIsSubmitting);
        toast.success('Registration successful! Please check your email for OTP.');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Registration failed. Please try again.');
      }
    } else {
      toast.error('Please fill the details correctly before submitting.');
    }
  };


  const getInputStyle = (field: FieldState) => `
    w-full pb-2 border-b-2 
    ${field.touched && field.error ? "border-red-500" : "border-gray-300"}
    ${field.touched && !field.error ? "border-green-500" : ""}
    focus:border-black outline-none
  `;

  return (
    <div className="min-h-screen bg-[#E9E9E9] p-3 md:p-6 lg:p-8 relative">
      <div className="top-8 left-8">
        <img src={IMAGES.navBarLogoDark} alt="WorkSphere Logo" className="w-32 h-auto" />
      </div>

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">
        {/* Left side content remains the same */}
        <div className="text-[#2C3E50] space-y-10">
          <h1 className="text-4xl sm:text-5xl font-bold leading-snug mt-8 sm:mt-0">
            Streamline Your Company Management with WorkSphere
          </h1>
          <p className="text-lg md:text-xltext-[#333333]">
            Enjoy efficient operations, enhanced employee engagement, and improved workforce outcomes.
          </p>
          
          <div className="grid grid-cols-3 gap-4 pt-8">
            <div>
              <h3 className="text-4xl font-bold">100+</h3>
              <p className="text-gray-900">Enterprises</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold">200k+</h3>
              <p className="text-gray-900">Happy Users</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold">15+</h3>
              <p className="text-gray-900">Countries</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl max-w-lg mx-auto w-full">
          <h1 className="text-xl font-bold mb-6">CREATE YOUR ACCOUNT</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                Company Name
              </label>
              <input
                type="text"
                id="companyName"
                placeholder="Enter your company name"
                value={formState.companyName.value}
                onChange={handleChange("companyName")}
                className={getInputStyle(formState.companyName)}
              />
              {formState.companyName.touched && formState.companyName.error && (
                <p className="text-sm text-red-500 mt-1">{formState.companyName.error}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="name@company.com"
                  value={formState.email.value}
                  onChange={handleChange("email")}
                  className={getInputStyle(formState.email)}
                />
                {formState.email.touched && formState.email.error && (
                  <p className="text-sm text-red-500 mt-1">{formState.email.error}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  placeholder="Enter phone number"
                  value={formState.phone.value}
                  onChange={handleChange("phone")}
                  className={getInputStyle(formState.phone)}
                />
                {formState.phone.touched && formState.phone.error && (
                  <p className="text-sm text-red-500 mt-1">{formState.phone.error}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  placeholder="Create a strong password"
                  value={formState.password.value}
                  onChange={handleChange("password")}
                  className={getInputStyle(formState.password)}
                />
                {formState.password.touched && formState.password.error && (
                  <p className="text-sm text-red-500 mt-1">{formState.password.error}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  placeholder="Confirm your password"
                  value={formState.confirmPassword.value}
                  onChange={handleChange("confirmPassword")}
                  className={getInputStyle(formState.confirmPassword)}
                />
                {formState.confirmPassword.touched && formState.confirmPassword.error && (
                  <p className="text-sm text-red-500 mt-1">{formState.confirmPassword.error}</p>
                )}
              </div>
            </div>

            {errorMessage && (
              <p className="text-sm text-red-500">{errorMessage}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#4598c5] text-white py-3 px-6 rounded-lg hover:bg-[#3D7EBD] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </button>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-gray-300 w-full"></div>
              <span className="bg-white px-4 text-sm text-gray-500">OR</span>
              <div className="border-t border-gray-300 w-full"></div>
            </div>

            <button
              type="button"
              className="w-full flex items-center justify-center space-x-2 border border-gray-300 rounded-lg py-3 px-4 hover:bg-gray-50 transition duration-300"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span className="text-gray-700 font-medium">Continue with Google</span>
            </button>

            <p className="text-sm text-gray-500 text-center">
              Already using WorkSphere?{" "}
              <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign in to your workspace
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;