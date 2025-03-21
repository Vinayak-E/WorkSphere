import api from '@/api/axios';
import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { fetchSubscriptions } from '@/services/admin/subscription.service';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
interface SubscriptionPlan {
  _id: string;
  planName: string;
  description: string;
  price: number;
  durationInMonths: number;
  planType: string;
  isActive: boolean;
  features: string[];
  employeeCount?: number;
  projectCount?: number;
}

const SelectPlanPage = () => {
  const [subscriptions, setSubscriptions] =useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] =useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    const getSubscriptions = async () => {
      try {
        setLoading(true);
        const response = await fetchSubscriptions();
        const activePlans: SubscriptionPlan[] = response.data.filter(
          (plan: SubscriptionPlan) => plan.isActive && plan.planType !== 'Trial'
        );
        setSubscriptions(activePlans);
      } catch (err: unknown) {
        setError('Failed to load subscription plans. Please try again later.');
        console.error('Error fetching subscriptions:', err);
      } finally {
        setLoading(false);
      }
    };

    getSubscriptions();
  }, []);
  

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
  };

   const handleProceedToPayment = async () => {
    if (!selectedPlan) return;

    try {
      const response = await api.post('/company/checkout/create-session', {
        planId: selectedPlan._id,
        billingInterval,
      });

      const stripe = await stripePromise;

      if (!stripe) {
        setError('Stripe initialization failed. Please try again.');
        return;
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId: response.data.sessionId,
      });

      if (error) {
        console.error('Stripe checkout error:', error);
        setError('Payment processing failed. Please try again.');
      }
    } catch (err: unknown) {
      console.error('Error creating checkout session:', err);
      setError('Failed to process payment. Please try again later.');
    }
  };


  const calculatePrice = (plan:SubscriptionPlan) => {
    if (billingInterval === 'yearly') {
      return (plan.price * plan.durationInMonths * 0.9).toFixed(2);
    }
    return plan.price.toFixed(2);
  };

  const getDurationText = (plan : SubscriptionPlan) => {
    if (billingInterval === 'yearly') {
      return `${plan.durationInMonths} months`;
    }
    return 'per month';
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
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Choose Your Plan
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
            Select the subscription plan that best fits your company's needs
          </p>
          
          {/* Billing interval toggle */}
          <div className="mt-8 flex justify-center">
            <div className="relative inline-flex items-center p-1 bg-gray-200 rounded-full">
              <button
                onClick={() => setBillingInterval('monthly')}
                className={`px-4 py-2 text-sm font-medium rounded-full ${
                  billingInterval === 'monthly' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingInterval('yearly')}
                className={`px-4 py-2 text-sm font-medium rounded-full ${
                  billingInterval === 'yearly' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'
                }`}
              >
                Yearly (10% off)
              </button>
            </div>
          </div>
        </div>

        {subscriptions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No subscription plans available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {subscriptions.map((plan) => (
              <div 
                key={plan._id}
                className={`rounded-lg shadow-lg overflow-hidden divide-y divide-gray-200 ${
                  selectedPlan?._id === plan._id ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <div className="bg-white p-6">
                  <div className="flex justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">{plan.planName}</h2>
                    <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {plan.planType}
                    </span>
                  </div>
                  <p className="mt-4 text-sm text-gray-500">{plan.description}</p>
                  <p className="mt-6">
                    <span className="text-4xl font-extrabold text-gray-900">${calculatePrice(plan)}</span>
                    <span className="text-base font-medium text-gray-500"> {getDurationText(plan)}</span>
                  </p>
                </div>
                <div className="px-6 pt-6 pb-8 bg-gray-50">
                  <h3 className="text-sm font-medium text-gray-900 tracking-wide">What's included</h3>
                  <ul className="mt-4 space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <p className="ml-3 text-sm text-gray-700">{feature}</p>
                      </li>
                    ))}
                    {plan.employeeCount && (
                      <li className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <p className="ml-3 text-sm text-gray-700">Up to {plan.employeeCount} employees</p>
                      </li>
                    )}
                    {plan.projectCount && (
                      <li className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <p className="ml-3 text-sm text-gray-700">Up to {plan.projectCount} projects</p>
                      </li>
                    )}
                  </ul>
                  <div className="mt-6">
                    <button
                      onClick={() => handleSelectPlan(plan)}
                      className={`w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium ${
                        selectedPlan?._id === plan._id
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-white text-blue-600 border-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      {selectedPlan?._id === plan._id ? 'Selected' : 'Select Plan'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <button
            onClick={handleProceedToPayment}
            disabled={!selectedPlan}
            className={`px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-md ${
              selectedPlan
                ? 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Proceed to Payment
          </button>
          {!selectedPlan && (
            <p className="mt-2 text-sm text-gray-500">Please select a plan to continue</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SelectPlanPage;