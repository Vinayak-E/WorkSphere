import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { CheckCircle, Loader } from 'lucide-react';
import { fetchSubscriptions } from '@/services/admin/subscription.service';
import IMAGES from '@/assets/images/image';
import { Link, useNavigate } from 'react-router-dom';

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

const PricingPage = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const pageRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadSubscriptions();

    const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });

    timeline.fromTo(
      pageRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8 }
    );

    const elements = document.querySelectorAll('.animate-in');
    gsap.fromTo(
      elements,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out', delay: 0.2 }
    );
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

  const handleChoosePlan = () => {

    navigate('/register');
  };

  return (
    <div ref={pageRef} className="bg-background min-h-screen">
      {/* Header/Navigation */}
      <div className="fixed top-0 left-0 right-0 bg-background/90 backdrop-blur-sm z-50 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center">
              <img
                src={IMAGES.navBarLogoDark}
                alt="WorkSphere Logo"
                className="h-12 w-auto transition-transform duration-300 hover:scale-105"
              />
            </Link>
            <Link
              to="/register"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-4 rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/80 to-primary py-16 px-4 sm:px-6 lg:px-8 pt-28">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-primary-foreground animate-in">Pricing Plans</h1>
          <p className="mt-2 text-lg text-primary-foreground/90 animate-in">
            Choose the perfect plan for your team and streamline your workflow with WorkSphere.
          </p>
        </div>
      </div>

      {/* Plans Section */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-64 animate-in">
            <Loader className="h-12 w-12 text-primary animate-spin" />
            <span className="ml-3 text-foreground">Loading plans...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div 
                key={plan._id} 
                className={`
                  bg-card rounded-xl p-8 shadow-sm border animate-in
                  ${plan.planType === 'Premium' 
                    ? 'border-primary shadow-md relative' 
                    : 'border-border'
                  }
                  transition-all duration-300 transform hover:shadow-lg hover:-translate-y-1
                `}
              >
                {plan.planType === 'Premium' && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground py-1 px-3 rounded-bl-lg text-sm font-medium">
                    Most Popular
                  </div>
                )}
                
                <h3 className="text-2xl font-semibold text-foreground mb-3">{plan.planName}</h3>
                <p className="text-muted-foreground mb-6 h-12">{plan.description}</p>
                
                <div className="mb-6">
                  <span className="text-3xl font-bold text-foreground">${getMonthlyPrice(plan)}</span>
                  <span className="text-muted-foreground">/month</span>
                  {plan.durationInMonths > 1 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Billed ${plan.price} every {plan.durationInMonths} months
                    </p>
                  )}
                </div>

                <div className="space-y-3 mb-6">
                  {plan.employeeCount && (
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-primary mr-2" />
                      <span className="text-foreground">Up to {plan.employeeCount} employees</span>
                    </div>
                  )}
                  
                  {plan.projectCount && (
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-primary mr-2" />
                      <span className="text-foreground">Up to {plan.projectCount} projects</span>
                    </div>
                  )}
                  
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-primary mr-2" />
                      <span className="text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={() => handleChoosePlan()}
                  className={`
                    w-full flex justify-center py-3 px-4 border rounded-lg shadow-sm font-medium
                    transition-all duration-300 transform hover:scale-[1.02]
                    ${plan.planType === 'Premium' 
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90 border-transparent' 
                      : 'bg-background border-input hover:bg-background/90 text-foreground'
                    }
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
                  `}
                >
                  {plan.planType === 'Trial' ? 'Start Free Trial' : 'Choose Plan'}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Plan Comparison Table */}
        <div className="mt-16 animate-in">
          <h2 className="text-2xl font-semibold text-foreground mb-8 text-center">Plan Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-secondary/20">
                  <th className="p-4 text-left font-semibold border-b border-border text-foreground">Feature</th>
                  {plans.map(plan => (
                    <th key={plan._id} className="p-4 text-center font-semibold border-b border-border text-foreground">
                      {plan.planName}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-4 border-b border-border text-foreground">Price</td>
                  {plans.map(plan => (
                    <td key={plan._id} className="p-4 text-center border-b border-border text-foreground">
                      ${getMonthlyPrice(plan)}/month
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 border-b border-border text-foreground">Employees</td>
                  {plans.map(plan => (
                    <td key={plan._id} className="p-4 text-center border-b border-border text-foreground">
                      {plan.employeeCount || "N/A"}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 border-b border-border text-foreground">Projects</td>
                  {plans.map(plan => (
                    <td key={plan._id} className="p-4 text-center border-b border-border text-foreground">
                      {plan.projectCount || "N/A"}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 border-b border-border text-foreground">Duration</td>
                  {plans.map(plan => (
                    <td key={plan._id} className="p-4 text-center border-b border-border text-foreground">
                      {plan.durationInMonths} {plan.durationInMonths === 1 ? 'month' : 'months'}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 animate-in">
          <h2 className="text-2xl font-semibold text-foreground mb-8 text-center">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
              <h3 className="text-lg font-medium text-foreground mb-2">How do I upgrade my plan?</h3>
              <p className="text-muted-foreground">You can upgrade your plan at any time from your account settings. Your new features will be available immediately.</p>
            </div>
            <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
              <h3 className="text-lg font-medium text-foreground mb-2">Can I cancel my subscription?</h3>
              <p className="text-muted-foreground">Yes, you can cancel your subscription anytime. Your plan will remain active until the end of your current billing cycle.</p>
            </div>
            <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
              <h3 className="text-lg font-medium text-foreground mb-2">What happens when my trial ends?</h3>
              <p className="text-muted-foreground">When your trial ends, you'll be prompted to select a paid plan to continue using all features.</p>
            </div>
            <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
              <h3 className="text-lg font-medium text-foreground mb-2">Do you offer custom plans?</h3>
              <p className="text-muted-foreground">Yes, we offer custom enterprise plans for larger teams. Contact our sales team for more information.</p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-16 bg-secondary/20 rounded-xl p-8 border border-secondary/20 animate-in">
          <h3 className="text-lg font-medium text-foreground mb-2">Need help choosing the right plan?</h3>
          <p className="text-muted-foreground mb-4">
            Our team is ready to help you find the perfect solution for your organization's needs.
          </p>
          <Link 
            to="/contact" 
            className="inline-flex items-center text-primary hover:text-primary/90 hover:underline"
          >
            Contact our sales team
            <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;