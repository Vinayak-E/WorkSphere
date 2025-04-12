import React, { useState, useEffect } from 'react';
import { CheckCircle, Loader } from 'lucide-react';
import { fetchSubscriptions } from '@/services/admin/subscription.service';


interface SubscriptionPlan {
  _id: string;
  planName: string;
  description: string;
  price: number;
  planType: "Trial" | "Basic" | "Premium";
  durationInMonths: number;
  features: string[];
  employeeCount: number | null;
  projectCount: number | null;
  isActive: boolean;
}

const PricingPage: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await fetchSubscriptions();
      if (response.success) {
        setPlans(response.data);
      }
    } catch (error) {
      console.error("Error loading subscription plans:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMonthlyPrice = (plan: SubscriptionPlan): string => {
    if (!plan.price || !plan.durationInMonths) return '0';
    return (plan.price / plan.durationInMonths).toFixed(2);
  };

  return (
    <div className="py-12 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Select the perfect plan for your team's needs. All plans include our core features with different levels of access.
        </p>
      </div>

      {/* Plans Display */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader className="animate-spin h-8 w-8 text-blue-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div 
              key={plan._id} 
              className={`
                border rounded-xl overflow-hidden shadow-lg transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1
                ${plan.planType === 'Premium' ? 'border-blue-500 relative' : 'border-gray-200'}
              `}
            >
              {plan.planType === 'Premium' && (
                <div className="absolute top-0 right-0 bg-blue-600 text-white py-1 px-3 rounded-bl-lg text-sm font-medium">
                  Most Popular
                </div>
              )}
              
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{plan.planName}</h3>
                <p className="text-gray-600 mb-4 h-12">{plan.description}</p>
                
                <div className="mb-6">
                  <span className="text-3xl font-bold">${getMonthlyPrice(plan)}</span>
                  <span className="text-gray-500">/month</span>
                  {plan.durationInMonths > 1 && (
                    <p className="text-sm text-gray-500 mt-1">
                      Billed ${plan.price} every {plan.durationInMonths} months
                    </p>
                  )}
                </div>

                <div className="space-y-3 mb-6">
                  {plan.employeeCount && (
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span>Up to {plan.employeeCount} employees</span>
                    </div>
                  )}
                  
                  {plan.projectCount && (
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span>Up to {plan.projectCount} projects</span>
                    </div>
                  )}
                  
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                
                <button
                  className={`w-full py-3 rounded-md font-medium transition-colors
                    ${plan.planType === 'Premium' 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-gray-100 hover:bg-gray-200'}
                  `}
                >
                  {plan.planType === 'Trial' ? 'Start Free Trial' : 'Choose Plan'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comparison Table */}
      <div className="mt-20">
        <h2 className="text-2xl font-bold text-center mb-8">Compare Plans</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-4 text-left font-semibold border-b">Feature</th>
                {plans.map(plan => (
                  <th key={plan._id} className="p-4 text-center font-semibold border-b">
                    {plan.planName}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-4 border-b">Price</td>
                {plans.map(plan => (
                  <td key={plan._id} className="p-4 text-center border-b">
                    ${getMonthlyPrice(plan)}/month
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 border-b">Employees</td>
                {plans.map(plan => (
                  <td key={plan._id} className="p-4 text-center border-b">
                    {plan.employeeCount || "N/A"}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 border-b">Projects</td>
                {plans.map(plan => (
                  <td key={plan._id} className="p-4 text-center border-b">
                    {plan.projectCount || "N/A"}
                  </td>
                ))}
              </tr>
              {/* We'll add a few common features for comparison */}
              <tr>
                <td className="p-4 border-b">Duration</td>
                {plans.map(plan => (
                  <td key={plan._id} className="p-4 text-center border-b">
                    {plan.durationInMonths} {plan.durationInMonths === 1 ? 'month' : 'months'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-20">
        <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">How do I upgrade my plan?</h3>
            <p className="text-gray-600">You can upgrade your plan at any time from your account settings. Your new features will be available immediately.</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Can I cancel my subscription?</h3>
            <p className="text-gray-600">Yes, you can cancel your subscription anytime. Your plan will remain active until the end of your current billing cycle.</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">What happens when my trial ends?</h3>
            <p className="text-gray-600">When your trial ends, you'll be prompted to select a paid plan to continue using all features.</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Do you offer custom plans?</h3>
            <p className="text-gray-600">Yes, we offer custom enterprise plans for larger teams. Contact our sales team for more information.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;