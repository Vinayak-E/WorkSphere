
import { useState,} from "react";
import IMAGES from "../../assets/images/image";
import api from "../../api/axios";
import { useNavigate} from "react-router-dom";
import { AxiosError } from "axios";
import { toast, ToastContainer } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';



const AdminLogin: React.FC = () => {
  const [email,setEmail] = useState('')
  const [password, setPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword1, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const togglePassword1Visibility = () => {
    setShowPassword(!showPassword1);
  };



  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const inputPassword = password.trim();
    const inputEmail  = email.trim()

    setPasswordMessage('');
    setEmailMessage('');

    let isValid = true;

    if (!inputPassword) {
        setPasswordMessage('Please enter the password');
        isValid = false;
    } else if (inputPassword.length < 8) {
        setPasswordMessage('Minimum 8 characters');
        isValid = false;
    }

    if (!inputEmail) {
        setEmailMessage('Email is required');
        isValid = false;
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(inputEmail)) {
        setEmailMessage('Passwords do not match!');
        isValid = false;
    }
    if (isValid) {
        try {
            const response = await api.post('/admin/login',{inputEmail,inputPassword});
            console.log('Response: ', response)
            if (response.status !== 200) {
                return setErrorMessage(response.data.message);
            }
            if (response.data) {
                toast.success('Login successfull');
       
                    navigate('/admin/dashboard');
            
            }
        } catch (error: unknown) {
          if (error instanceof AxiosError) {
            const errorMessage = error.response?.data?.message || 'An error occurred';
            setErrorMessage(errorMessage);
          } else {
            console.error('Login failed:', error);
            setErrorMessage('An unexpected error occurred');
          }
        }
    }
  }

  return (
    <div className="min-h-screen bg-[#E9E9E9] p-3 md:p-6 lg:p-8  relative">
        <ToastContainer 
        position="top-right" 
        autoClose={5000} 
        hideProgressBar={false} 
        newestOnTop={false} 
        closeOnClick 
        rtl={false} 
        pauseOnFocusLoss 
        draggable 
        pauseOnHover 
    />

      <div className="top-8 left-8">
        <img src={IMAGES.navBarLogoDark} alt="WorkSphere Logo" className="w-32 h-auto" />
      </div>

    
      

        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl max-w-lg mx-auto w-full">
          <h1 className="text-xl font-bold mb-6">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
              <label htmlFor="Email" className="block text-sm font-medium text-gray-700 mb-2">
               Email
              </label>
              <input
                type='email'
                id="email"
                placeholder="Enter your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pb-2 border-b-2 ${
                  emailMessage ? "border-red-500" : "border-gray-300"
                } focus:border-black outline-none`}
              />
              {emailMessage && <p className="text-sm text-red-500">{emailMessage}</p>}
              
            </div>

            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type={showPassword1 ? "text" : "password"} 
                id="password"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pb-2 border-b-2 ${
                  passwordMessage ? "border-red-500" : "border-gray-300"
                } focus:border-black outline-none`}
              />
              {passwordMessage && <p className="text-sm text-red-500">{passwordMessage}</p>}
              <button
                        type="button"
                        onClick={togglePassword1Visibility}
                        className="absolute right-3 top-8 text-xl text-gray-600"
                    >
                        {showPassword1 ? <FaEyeSlash /> : <FaEye />}
                    </button>
            </div>
            {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-black text-white py-3 px-6 rounded-lg hover:bg-gray-800 transition"
            >
              {isSubmitting ? "Please wait..." : "Submit"}
            </button>
          </form>
        </div>
      </div>
  
  );
};

export default AdminLogin;
