import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '@/api/axios';

const PaymentSuccessPage = () => {
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const queryParams = new URLSearchParams(location.search);
        const sessionId = queryParams.get('session_id');
          console.log("sessionId",sessionId)
        if (!sessionId) {
          setError('Invalid payment session');
          setLoading(false);
          return;
        }

        const response = await api.get(`/company/checkout/payment-success?session_id=${sessionId}`);
        console.log('response',response)
        setPaymentDetails(response.data.data);
      } catch (err) {
        console.error('Payment verification error:', err);
        setError('Failed to verify payment');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [location.search]);

  const handleContinue = () => {
    navigate('/company/');
  };
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error! </strong>
          <span className="block sm:inline">{error}</span>
          <div className="mt-4">
            <button
              onClick={() => navigate('/company/select-plan')}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
            >
              Back to Plans
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        <div className="mb-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
            <svg className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Payment Successful!</h2>
        
        <p className="text-gray-600 mb-6">
          Your subscription has been successfully activated. You now have access to all the features included in your selected plan.
        </p>
        
        {paymentDetails && (
          <div className="mb-8 bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500 mb-2">Payment Status: <span className="font-medium text-gray-800 capitalize">{paymentDetails.status}</span></p>
            {paymentDetails.customerEmail && (
              <p className="text-sm text-gray-500">Email: <span className="font-medium text-gray-800">{paymentDetails.customerEmail}</span></p>
            )}
          </div>
        )}
        
        <div className="flex flex-col space-y-4">
          <button
            onClick={handleContinue}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md shadow-sm"
          >
            Continue to Dashboard
          </button>
          
          <button
            onClick={() => window.location.href = 'mailto:support@yourcompany.com'}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Need help? Contact support
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;