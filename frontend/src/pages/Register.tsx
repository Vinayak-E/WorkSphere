import { toast } from 'react-toastify';
import { useState, FormEvent } from 'react';
import IMAGES from '../assets/images/image';
import { validateForm } from '@/utils/validations';
import { Link, useNavigate } from 'react-router-dom';
import { AuthController } from '@/controllers/auth.controller';
import { FormState, FieldState, FieldName } from '@/types/types';

const Register = () => {
  const [formState, setFormState] = useState<FormState>({
    companyName: { value: '', error: '', touched: false, isValid: false },
    email: { value: '', error: '', touched: false, isValid: false },
    phone: { value: '', error: '', touched: false, isValid: false },
    industry: { value: '', error: '', touched: false, isValid: false },
    businessRegNo: { value: '', error: '', touched: false, isValid: false },
    city: { value: '', error: '', touched: false, isValid: false },
    state: { value: '', error: '', touched: false, isValid: false },
    country: { value: '', error: '', touched: false, isValid: false },
    zipcode: { value: '', error: '', touched: false, isValid: false },
    password: { value: '', error: '', touched: false, isValid: false },
    confirmPassword: { value: '', error: '', touched: false, isValid: false },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange =
    (name: FieldName) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFormState(prev => ({
        ...prev,
        [name]: { ...prev[name], value: e.target.value, touched: true },
      }));
    };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errors = validateForm(formState);

    let isValid = true;
    const updatedFormState = { ...formState };

    (Object.keys(errors) as FieldName[]).forEach(key => {
      updatedFormState[key].error = errors[key];
      updatedFormState[key].isValid = !errors[key];
      if (errors[key]) isValid = false;
    });

    setFormState(updatedFormState);

    if (isValid) {
      const signupData = {
        companyName: formState.companyName.value,
        email: formState.email.value,
        phone: formState.phone.value,
        industry: formState.industry.value,
        businessRegNo: formState.businessRegNo.value,
        city: formState.city.value,
        state: formState.state.value,
        country: formState.country.value,
        zipcode: formState.zipcode.value,
        password: formState.password.value,
      };

      setIsSubmitting(true);
      try {
        await AuthController.handleSignup(signupData, navigate);
        toast.success(
          'Registration successful! Please check your email for OTP.'
        );
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : 'Registration failed. Please try again.'
        );
      } finally {
        setIsSubmitting(false);
      }
    } else {
      toast.error('Please fill the details correctly before submitting.');
    }
  };

  const getInputStyle = (field: FieldState) => `
    w-full pb-2 border-b-2 
    ${field.touched && field.error ? 'border-red-500' : 'border-gray-300'}
    ${field.touched && !field.error ? 'border-green-500' : ''}
    focus:border-black outline-none
  `;

  return (
    <div className="min-h-screen bg-background p-2 md:p-6 lg:p-8 relative">
      <Link to="/">
        <img
          src={IMAGES.navBarLogoDark}
          alt="WorkSphere Logo"
          className="w-28 h-auto cursor-pointer"
        />
      </Link>

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">
        <div className="text-foreground space-y-10 md:pr-6 md:pb-44 leading-loose">
          <h1 className="text-4xl sm:text-5xl font-bold mt-8 sm:mt-0">
            Streamline Your Company Management with WorkSphere
          </h1>
          <p className="text-lg md:text-xl">
            Enjoy efficient operations, enhanced employee engagement, and
            improved workforce outcomes.
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
          <h1 className="text-xl font-bold mb-6">CREATE YOUR ACCOUNT</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="companyName"
                className="block text-sm font-medium text-foreground"
              >
                Company Name
              </label>
              <input
                type="text"
                id="companyName"
                placeholder="Enter your company name"
                value={formState.companyName.value}
                onChange={handleChange('companyName')}
                className={getInputStyle(formState.companyName)}
              />
              {formState.companyName.touched && formState.companyName.error && (
                <p className="text-sm text-destructive mt-1">
                  {formState.companyName.error}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-foreground"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="name@company.com"
                  value={formState.email.value}
                  onChange={handleChange('email')}
                  className={getInputStyle(formState.email)}
                />
                {formState.email.touched && formState.email.error && (
                  <p className="text-sm text-destructive mt-1">
                    {formState.email.error}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-foreground"
                >
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  placeholder="Enter phone number"
                  value={formState.phone.value}
                  onChange={handleChange('phone')}
                  className={getInputStyle(formState.phone)}
                />
                {formState.phone.touched && formState.phone.error && (
                  <p className="text-sm text-destructive mt-1">
                    {formState.phone.error}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="industry"
                  className="block text-sm font-medium text-foreground"
                >
                  Industry
                </label>
                <input
                  type="text"
                  id="industry"
                  placeholder="e.g. Retail, Finance, IT Services"
                  value={formState.industry.value}
                  onChange={handleChange('industry')}
                  className={getInputStyle(formState.industry)}
                />
                {formState.industry.touched && formState.industry.error && (
                  <p className="text-sm text-destructive mt-1">
                    {formState.industry.error}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="businessRegNo"
                  className="block text-sm font-medium text-foreground"
                >
                  Business Registration Number
                </label>
                <input
                  type="text"
                  id="businessRegNo"
                  placeholder="Enter your registration number"
                  value={formState.businessRegNo.value}
                  onChange={handleChange('businessRegNo')}
                  className={getInputStyle(formState.businessRegNo)}
                />
                {formState.businessRegNo.touched &&
                  formState.businessRegNo.error && (
                    <p className="text-sm text-destructive mt-1">
                      {formState.businessRegNo.error}
                    </p>
                  )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="city"
                  className="block text-sm font-medium text-foreground"
                >
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  placeholder="Enter your City"
                  value={formState.city.value}
                  onChange={handleChange('city')}
                  className={getInputStyle(formState.city)}
                />
                {formState.city.touched && formState.city.error && (
                  <p className="text-sm text-destructive mt-1">
                    {formState.city.error}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="state"
                  className="block text-sm font-medium text-foreground"
                >
                  State
                </label>
                <input
                  type="text"
                  id="state"
                  placeholder="Enter your State"
                  value={formState.state.value}
                  onChange={handleChange('state')}
                  className={getInputStyle(formState.state)}
                />
                {formState.state.touched && formState.state.error && (
                  <p className="text-sm text-destructive mt-1">
                    {formState.state.error}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="country"
                  className="block text-sm font-medium text-foreground"
                >
                  Country
                </label>
                <select
                  id="country"
                  value={formState.country.value}
                  onChange={handleChange('country')}
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
                  <p className="text-sm text-destructive mt-1">
                    {formState.country.error}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="zipcode"
                  className="block text-sm font-medium text-foreground"
                >
                  Zipcode
                </label>
                <input
                  type="text"
                  id="zipcode"
                  placeholder="Enter your Zipcode"
                  value={formState.zipcode.value}
                  onChange={handleChange('zipcode')}
                  className={getInputStyle(formState.zipcode)}
                />
                {formState.zipcode.touched && formState.zipcode.error && (
                  <p className="text-sm text-destructive mt-1">
                    {formState.zipcode.error}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-foreground"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  placeholder="Create a strong password"
                  value={formState.password.value}
                  onChange={handleChange('password')}
                  className={getInputStyle(formState.password)}
                />
                {formState.password.touched && formState.password.error && (
                  <p className="text-sm text-destructive mt-1">
                    {formState.password.error}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-foreground"
                >
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  placeholder="Confirm your password"
                  value={formState.confirmPassword.value}
                  onChange={handleChange('confirmPassword')}
                  className={getInputStyle(formState.confirmPassword)}
                />
                {formState.confirmPassword.touched &&
                  formState.confirmPassword.error && (
                    <p className="text-sm text-destructive mt-1">
                      {formState.confirmPassword.error}
                    </p>
                  )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-card py-3 px-6 rounded-xl hover:bg-[#3D7EBD] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>

            <p className="text-sm text-gray-500 text-center">
              Already using WorkSphere?{' '}
              <Link
                to="/login"
                className="text-primary hover:text-blue-700 font-medium"
              >
                Sign in to your workspace
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
