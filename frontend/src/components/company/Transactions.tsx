import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Calendar,
  Clock,
  CreditCard,
  Package,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import api from '@/api/axios';
import { RootState } from '@/redux/store';

const CompanyTransactionsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [activeTab, setActiveTab] = useState('history');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    const fetchCurrentPlan = async () => {
      try {
        const planData = await api.get('/company/current-plan');
        if (planData.data.data) {
          setCurrentPlan({ ...planData.data.data, isFreePlan: false });
        } else {
          setCurrentPlan({
            isFreePlan: true,
            plan: {
              name: 'Free Plan',
              description: 'Basic features for getting started',
              features: ['Limited access', 'Basic support'],
            },
            payment: {
              status: user.userData.subscriptionStatus || 'Active',
              amount: 0,
            },
            endDate: user.userData.subscriptionEndDate,
          });
        }
      } catch (err) {
        console.error('Error fetching current plan:', err);
        setError(err.message);
      }
    };
    fetchCurrentPlan();
  }, [user]);
  useEffect(() => {
    const fetchPaymentHistory = async () => {
      try {
        setLoading(true);
        const historyData = await api.get(
          `/company/payment-history?page=${currentPage}&limit=10`
        );
        console.log('history', historyData);
        setPaymentHistory(historyData.data.data.payments || []);
        setTotalPages(historyData.data.data.totalPages || 1);
        setError(null);
      } catch (err) {
        console.error('Error fetching payment history:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPaymentHistory();
  }, [currentPage]);

  const formatDate = dateString => {
    if (!dateString || isNaN(Date.parse(dateString))) {
      return 'N/A';
    }
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const formatCurrency = amount => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const StatusBadge = ({ status }) => {
    const getStatusConfig = status => {
      switch (status.toLowerCase()) {
        case 'succeeded':
          return {
            color: 'bg-green-100 text-green-800',
            icon: <CheckCircle className="w-4 h-4 mr-1" />,
          };
        case 'failed':
          return {
            color: 'bg-red-100 text-red-800',
            icon: <XCircle className="w-4 h-4 mr-1" />,
          };
        case 'pending':
          return {
            color: 'bg-yellow-100 text-yellow-800',
            icon: <Clock className="w-4 h-4 mr-1" />,
          };
        default:
          return {
            color: 'bg-gray-100 text-gray-800',
            icon: <AlertCircle className="w-4 h-4 mr-1" />,
          };
      }
    };

    const { color, icon } = getStatusConfig(status);

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}
      >
        {icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <XCircle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="sm:hidden">
        <select
          className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          value={activeTab}
          onChange={e => setActiveTab(e.target.value)}
        >
          <option value="history">Payment History</option>
          <option value="plan">Current Plan</option>
        </select>
      </div>
      <div className="hidden sm:block border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab('history')}
            className={`py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Payment History
          </button>
          <button
            onClick={() => setActiveTab('plan')}
            className={`py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center ${
              activeTab === 'plan'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Package className="w-4 h-4 mr-2" />
            Current Plan
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'history' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Payment History
            </h2>
            {paymentHistory.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">
                  No payment history found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Your payment transactions will appear here.
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Date
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Plan
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Amount
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Payment Method
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paymentHistory.map(payment => (
                        <tr key={payment._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <Calendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                              {formatDate(payment.paymentDate)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {payment.planName || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatCurrency(payment.amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {payment.paymentMethod}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={payment.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                <div className="mt-4 flex items-center justify-between">
                  <button
                    onClick={() =>
                      setCurrentPage(prev => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage(prev => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'plan' && (
          <div>
            <h1 className="text-xl font-semibold text-gray-900 mb-4">
              Current Subscription Plan
            </h1>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 bg-gray-50">
                <h3 className="text-lg leading-6 font-medium text-gray-900 ">
                  {currentPlan.plan.planName}
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  {currentPlan.plan.description}
                </p>
              </div>
              <div className="border-t border-gray-200">
                <dl>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Status
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <StatusBadge status={currentPlan.payment.status} />
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Amount
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {formatCurrency(currentPlan.payment.amount)}
                    </dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Billing Cycle
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {currentPlan.plan.billingCycle || 'Monthly'}
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Features
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                        {currentPlan.plan.features &&
                          currentPlan.plan.features.map((feature, index) => (
                            <li
                              key={index}
                              className="pl-3 pr-4 py-3 flex items-center justify-between text-sm"
                            >
                              <div className="w-0 flex-1 flex items-center">
                                <CheckCircle className="flex-shrink-0 h-5 w-5 text-green-500" />
                                <span className="ml-2 flex-1 w-0 truncate">
                                  {feature}
                                </span>
                              </div>
                            </li>
                          ))}
                        {(!currentPlan.plan.features ||
                          currentPlan.plan.features.length === 0) && (
                          <li className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                            <span className="text-gray-500">
                              No features listed
                            </span>
                          </li>
                        )}
                      </ul>
                    </dd>
                  </div>
                  {currentPlan.isFreePlan ? (
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">
                        Valid Until
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {formatDate(currentPlan.endDate)}
                      </dd>
                    </div>
                  ) : (
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">
                        Last Payment
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {formatDate(currentPlan.payment.paymentDate)}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyTransactionsDashboard;
