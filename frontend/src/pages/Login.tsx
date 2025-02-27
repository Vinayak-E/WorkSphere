import { useState, FormEvent } from "react";
import IMAGES from "../assets/images/image";
import api from "../api/axios";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import ForgotPasswordModal from "../components/ForgotPasswordModal";
import { toast } from "react-toastify";
import { authController } from "../controllers/authController";
import "react-toastify/dist/ReactToastify.css";

import { setUser } from "../redux/slices/authSlice";

interface FieldState {
  value: string;
  error: string;
  touched: boolean;
  isValid: boolean;
}

type FieldName = "email" | "password";

interface FormState {
  email: FieldState;
  password: FieldState;
}

interface IRoleRoutes {
  ADMIN: string;
  EMPLOYEE: string;
  MANAGER: string;
  COMPANY: string;
}

const Login = () => {
  const [formState, setFormState] = useState<FormState>({
    email: { value: "", error: "", touched: false, isValid: false },
    password: { value: "", error: "", touched: false, isValid: false },
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [userType, setUserType] = useState("EMPLOYEE");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleGoogleLogin = async () => {
    try {
      const user = await authController.handleGoogleLogin();
      console.log("User:", user);

      const { accessToken, refreshToken, user: userData } = user;

      dispatch(
        login({
          email: userData.email,
          accessToken,
          refreshToken,
          isAdmin: userData.isAdmin,
        }),
      );
      navigate("/dashboard");
    } catch (error) {
      console.error("Google login failed:", error);
      setErrorMessage("Google login failed. Please try again.");
    }
  };

  const validateField = (
    name: FieldName,
    value: string,
    allValues: FormState,
  ): FieldState => {
    let error = "";
    let isValid = true;

    switch (name) {
      case "email":
        if (!value) {
          error = "Email is required";
          isValid = false;
        } else if (
          !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)
        ) {
          error = "Please enter a valid email address";
          isValid = false;
        }
        break;

      case "password":
        if (!value) {
          error = "Password is required";
          isValid = false;
        } else if (value.length < 6) {
          error = "Password must be at least 6 characters";
          isValid = false;
        }
        break;
    }

    return { value, error, touched: true, isValid };
  };

  const handleChange =
    (name: FieldName) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      setFormState((prev) => ({
        ...prev,
        [name]: validateField(name, value, prev),
      }));
    };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validatedState = (
      Object.keys(formState) as FieldName[]
    ).reduce<FormState>(
      (acc, key) => ({
        ...acc,
        [key]: validateField(key, formState[key].value, formState),
      }),
      formState,
    );

    setFormState(validatedState);

    const isValid = Object.values(validatedState).every(
      (field) => field.isValid,
    );

    if (isValid) {
      setIsSubmitting(true);

      try {
        const response = await api.post("/auth/login", {
          email: formState.email.value,
          password: formState.password.value,
          userType,
        });

        if (response.status === 200 && response.data.success) {
          const { email, tenantId, role, forcePasswordChange } = response.data;

          dispatch(
            setUser({
              email,
              role,
              tenantId,
            }),
          );

          if (forcePasswordChange) {
            toast.info("Please change your default password before continuing");
            navigate("/passwordChange");
            return;
          }

          const roleRoutes: IRoleRoutes = {
            ADMIN: "/admin",
            COMPANY: "/company",
            MANAGER: "/employee",
            EMPLOYEE: "/employee",
          };
          let url = roleRoutes[role as keyof typeof roleRoutes];
          navigate(url);
        } else {
          setErrorMessage("Login failed. Please try again.");
        }
      } catch (error: unknown) {
        console.error("Login Error:", error);
        if (error instanceof AxiosError) {
          setErrorMessage(
            error.response?.data?.message || "An error occurred.",
          );
        } else {
          setErrorMessage("An unexpected error occurred.");
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  const getInputStyle = (field: FieldState) => `
    w-full pb-2 border-b-2 
    ${field.touched && field.error ? "border-red-500" : "border-gray-300"}
    ${field.touched && !field.error ? "border-green-500" : ""} focus:border-black outline-none`;

  return (
    <>
      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
      />
      <div className="min-h-screen bg-background p-3 md:p-6 lg:p-8 relative">
        <div className="top-0 left-0">
          <img
            src={IMAGES.navBarLogoDark}
            alt="WorkSphere Logo"
            className="w-32 h-auto"
          />
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">
          <div className="text-[#2C3E50] space-y-10">
            <h1 className="text-4xl sm:text-5xl font-bold leading-snug mt-8 sm:mt-0">
              {userType === "EMPLOYEE"
                ? "Welcome Back to Your Workspace"
                : "Streamline Your Company Management"}
            </h1>
            <p className="text-lg md:text-xl text-[#333333]">
              {userType === "EMPLOYEE"
                ? "Access your work environment securely and efficiently."
                : "Enhance operations and improve workforce management with WorkSphere."}
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

          <div className="bg-white rounded-3xl p-1 md:p-8 shadow-xl max-w-lg mx-auto w-full ">
            <h1 className="text-xl font-bold mb-6 text-center">
              {userType === "EMPLOYEE" ? "EMPLOYEE LOGIN" : "COMPANY LOGIN"}
            </h1>
            <div className="flex justify-center mb-6">
              <div className="inline-flex  mb-6  rounded-lg border border-gray-200 p-1">
                <button
                  onClick={() => setUserType("EMPLOYEE")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    userType === "EMPLOYEE"
                      ? "bg-[#6C7A89] text-white"
                      : "text-gray-500 hover:text-[#5B6770]"
                  }`}
                >
                  Employee Login
                </button>
                <button
                  onClick={() => setUserType("COMPANY")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    userType === "COMPANY"
                      ? "bg-[#6C7A89] text-white"
                      : "text-gray-500 hover:text-[#5B6770]"
                  }`}
                >
                  Company Login
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
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
                  <p className="text-sm text-red-500 mt-1">
                    {formState.email.error}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  placeholder="Enter your password"
                  value={formState.password.value}
                  onChange={handleChange("password")}
                  className={getInputStyle(formState.password)}
                />
                {formState.password.touched && formState.password.error && (
                  <p className="text-sm text-red-500 mt-1">
                    {formState.password.error}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-gray-400 hover:text-gray-900 hover:underline"
              >
                Forgot password?
              </button>

              {errorMessage && (
                <p className="text-sm text-red-500">{errorMessage}</p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary rounded-xl text-white py-3 px-6  hover:bg-[#3D7EBD] transition disabled:opacity-50 disabled:cursor-not-allowed "
              >
                {isSubmitting ? "Loading..." : "Login"}
              </button>

              {userType === "COMPANY" && (
                <>
                  {/* <div className="relative flex items-center justify-center">
              <div className="border-t border-gray-300 w-full"></div>
              <span className="bg-white px-4 text-sm text-gray-500">OR</span>
              <div className="border-t border-gray-300 w-full"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
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
              <span  className="text-gray-700 font-medium">Continue with Google</span>
            </button> */}

                  <p className="text-sm text-gray-500 text-center">
                    Don't have an account yet?{" "}
                    <a
                      href="/register"
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Create New Account
                    </a>
                  </p>
                </>
              )}
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
