import { useState, FormEvent } from "react";
import IMAGES from "../assets/images/image";
import { Link, useNavigate } from "react-router-dom";
import { handleSignup } from "@/controllers/authController";
import { validateForm } from "@/utils/validations";
import { FormState,FieldState,FieldName } from "@/types/types";
import { toast } from 'react-toastify';

const Register = () => {
  const [formState, setFormState] = useState<FormState>({
    companyName: { value: "", error: "", touched: false, isValid: false },
    email: { value: "", error: "", touched: false, isValid: false },
    phone: { value: "", error: "", touched: false, isValid: false },
    industry: { value: "", error: "", touched: false, isValid: false },
    bussinessRegNum: { value: "", error: "", touched: false, isValid: false },
    city: { value: "", error: "", touched: false, isValid: false },
    state: { value: "", error: "", touched: false, isValid: false },
    country: { value: "", error: "", touched: false, isValid: false },
    zipcode: { value: "", error: "", touched: false, isValid: false },
    password: { value: "", error: "", touched: false, isValid: false },
    confirmPassword: { value: "", error: "", touched: false, isValid: false },
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (name: FieldName) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement >) => {
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
    <div className="min-h-screen bg-background p-2 md:p-6 lg:p-8 relative">
      <Link to="/">
        <img src={IMAGES.navBarLogoDark} alt="WorkSphere Logo" className="w-28 h-auto cursor-pointer" />
      </Link>

  <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center ">
    <div className="text-foreground space-y-10 md:pr-6 md:pb-44 leading-loose ">
      <h1 className="text-4xl sm:text-5xl font-bold  mt-8 sm:mt-0 ">
        Streamline Your Company Management with WorkSphere
      </h1>
      <p className="text-lg md:text-xl">
        Enjoy efficient operations, enhanced employee engagement, and improved workforce outcomes.
      </p>

      <div className="grid grid-cols-3 gap-4 pt-8 text-primary">
        <div>
          <h3 className="text-4xl font-bold">100+</h3>
          <p className="text-foreground">Enterprises</p>
        </div>
        <div>
          <h3 className="text-4xl font-bold">200k+</h3>
          <p className="text-foreground">Happy Users</p>
        </div>
        <div>
          <h3 className="text-4xl font-bold">15+</h3>
          <p className="text-foreground">Countries</p>
        </div>
      </div>
    </div>

    <div className="bg-card rounded-3xl p-6 md:p-8 shadow-xl max-w-xl mx-auto w-full">
      <h1 className="text-xl  font-bold mb-6">CREATE YOUR ACCOUNT</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="companyName" className="block text-sm font-medium text-foreground">
            Company Name
          </label>
          <input type="text" id="companyName" placeholder="Enter your company name" value={formState.companyName.value}
            onChange={handleChange("companyName")} className={getInputStyle(formState.companyName)} />
          {formState.companyName.touched && formState.companyName.error && (
          <p className="text-sm text-destructive mt-1">{formState.companyName.error}</p>
          )}
        </div>  

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground">
              Email
            </label>
            <input type="email" id="email" placeholder="name@company.com" value={formState.email.value}
              onChange={handleChange("email")} className={getInputStyle(formState.email)} />
            {formState.email.touched && formState.email.error && (
            <p className="text-sm text-destructive mt-1">{formState.email.error}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-foreground">
              Phone
            </label>
            <input type="tel" id="phone" placeholder="Enter phone number" value={formState.phone.value}
              onChange={handleChange("phone")} className={getInputStyle(formState.phone)} />
            {formState.phone.touched && formState.phone.error && (
            <p className="text-sm text-destructive mt-1">{formState.phone.error}</p>
            )}
          </div>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="industry" className="block text-sm font-medium text-foreground">
              Industry
            </label>
            <input type="text" id="industry" placeholder="e.g.Retail,Finance,IT Services" value={formState.industry.value}
              onChange={handleChange("industry")} className={getInputStyle(formState.industry)} />
            {formState.industry.touched && formState.industry.error && (
            <p className="text-sm text-destructive mt-1">{formState.industry.error}</p>
            )}
          </div>

          <div>
            <label htmlFor="bussinessRegNum" className="block text-sm font-medium text-foreground">
            Business Registration Number
            </label>
            <input type="text" id="bussinessRegNum" placeholder="Enter your registration number" value={formState.bussinessRegNum.value}
              onChange={handleChange("bussinessRegNum")} className={getInputStyle(formState.bussinessRegNum)} />
            {formState.bussinessRegNum.touched && formState.bussinessRegNum.error && (
            <p className="text-sm text-destructive mt-1">{formState.bussinessRegNum.error}</p>
            )}
          </div>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-foreground">
              City
            </label>
            <input type="text" id="city" placeholder="Enter your City" value={formState.city.value}
              onChange={handleChange("city")} className={getInputStyle(formState.city)} />
            {formState.city.touched && formState.city.error && (
            <p className="text-sm text-destructive mt-1">{formState.city.error}</p>
            )}
          </div>

          <div>
            <label htmlFor="state" className="block text-sm font-medium text-foreground">
             State
            </label>
            <input type="text" id="state" placeholder="Enter your State" value={formState.state.value}
              onChange={handleChange("state")} className={getInputStyle(formState.state)} />
            {formState.state.touched && formState.state.error && (
            <p className="text-sm text-destructive mt-1">{formState.state.error}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-foreground">
            Country
          </label>
          <select 
            id="country" 
            value={formState.country.value}
            onChange={handleChange("country")} 
            className={getInputStyle(formState.country)}
          >
            <option value="">Select a country</option>
            <option value="United States">United States</option>
            <option value="Canada">Canada</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Australia">Australia</option>
            <option value="India">India</option>
            <option value="Germany">Germany</option>
            
          </select>
          {formState.country.touched && formState.country.error && (
            <p className="text-sm text-destructive mt-1">{formState.country.error}</p>
          )}
        </div>

          <div>
            <label htmlFor="zipcode" className="block text-sm font-medium text-foreground">
             Zipcode
            </label>
            <input type="text" id="zipcode" placeholder="Enter your State" value={formState.zipcode.value}
              onChange={handleChange("zipcode")} className={getInputStyle(formState.zipcode)} />
            {formState.zipcode.touched && formState.zipcode.error && (
            <p className="text-sm text-destructive mt-1">{formState.zipcode.error}</p>
            )}
          </div>
        </div>



        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground">
              Password
            </label>
            <input type="password" id="password" placeholder="Create a strong password" value={formState.password.value}
              onChange={handleChange("password")} className={getInputStyle(formState.password)} />
            {formState.password.touched && formState.password.error && (
            <p className="text-sm text-destructive mt-1">{formState.password.error}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground">
              Confirm Password
            </label>
            <input type="password" id="confirmPassword" placeholder="Confirm your password"
              value={formState.confirmPassword.value} onChange={handleChange("confirmPassword")}
              className={getInputStyle(formState.confirmPassword)} />
            {formState.confirmPassword.touched && formState.confirmPassword.error && (
            <p className="text-sm text-destructive mt-1">{formState.confirmPassword.error}</p>
            )}
          </div>
        </div>

        {errorMessage && (
        <p className="text-sm text-destructive">{errorMessage}</p>
        )}

        <button type="submit" disabled={isSubmitting}
          className="w-full bg-primary  text-card py-3 px-6 rounded-xl hover:bg-[#3D7EBD] transition disabled:opacity-50 disabled:cursor-not-allowed">
          {isSubmitting ? "Creating Account..." : "Create Account"}
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-secondary w-full"></div>
          <span className="bg-background px-4 text-sm text-secondary">OR</span>
          <div className="border-t border-secondary w-full"></div>
        </div>

        <button type="button"
          className="w-full flex items-center justify-center space-x-2 border border-gray-300 rounded-lg py-3 px-4 hover:bg-gray-50 transition duration-300">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4" />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853" />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05" />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335" />
          </svg>
          <span className="text-foreground font-medium">Continue with Google</span>
        </button>

        <p className="text-sm text-gray-500 text-center">
          Already using WorkSphere?{" "}
          <a href="/login" className="text-primary hover:text-blue-700 font-medium">
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