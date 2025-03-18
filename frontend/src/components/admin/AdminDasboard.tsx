import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, Users, CreditCard, BarChart2, ArrowUp, ArrowDown } from 'lucide-react';
import api from '@/api/axios';

const PaymentDashboard = () => {
  const [revenueStats, setRevenueStats] = useState(null);
  const [companyPayments, setCompanyPayments] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [companyLoading, setCompanyLoading] = useState(false);
  const [companyCurrentPage, setCompanyCurrentPage] = useState(1);
  const [companyTotalPages, setCompanyTotalPages] = useState(1);
  const [recentPaymentsPage, setRecentPaymentsPage] = useState(1);
  const [recentPaymentsTotalPages, setRecentPaymentsTotalPages] = useState(1);

  useEffect(() => {
    const fetchRevenueStats = async () => {
      try {
        setLoading(true);
        // Updated API call with page and limit
        const result = await api.get(`/admin/revenue-stats?page=${recentPaymentsPage}&limit=10`);
        if (result.data.success) {
          setRevenueStats(result.data.data);
          // Set total pages for recent payments
          setRecentPaymentsTotalPages(result.data.data.totalPages || 1);
          const uniqueCompanies = [];
          const companyIds = new Set();
          result.data.data.recentPayments.forEach(payment => {
            if (payment.companyId && !companyIds.has(payment.companyId)) {
              companyIds.add(payment.companyId);
              uniqueCompanies.push({
                id: payment.companyId,
                name: payment.tenantId || `Company ${payment.companyId}`,
              });
            }
          });
          setCompanies(uniqueCompanies);
        } else {
          console.error('Failed to fetch revenue stats');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching revenue stats:', error);
        setLoading(false);
      }
    };
    fetchRevenueStats();
  }, [recentPaymentsPage]); // Added recentPaymentsPage as a dependency

  useEffect(() => {
    if (selectedCompanyId) {
      console.log("tenanatId of selected company",selectedCompanyId)
      const fetchCompanyPayments = async () => {
        try {
          setCompanyLoading(true);
          const result = await api.get(`/admin/company/${selectedCompanyId}/payments?page=${companyCurrentPage}&limit=10`);
          if (result.data.success) {
            setCompanyPayments(result.data.data.payments || []);
            setCompanyTotalPages(result.data.data.totalPages || 1);
          } else {
            console.error('Failed to fetch company payments');
            setCompanyPayments([]);
          }
          setCompanyLoading(false);
        } catch (error) {
          console.error('Error fetching company payments:', error);
          setCompanyPayments([]);
          setCompanyLoading(false);
        }
      };
      fetchCompanyPayments();
    }
  }, [selectedCompanyId, companyCurrentPage]);

  useEffect(() => {
    setCompanyCurrentPage(1);
  }, [selectedCompanyId]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const calculateGrowth = () => {
    if (!revenueStats || revenueStats.monthlyRevenue.length < 2) return 0;
    const lastMonth = revenueStats.monthlyRevenue[revenueStats.monthlyRevenue.length - 1].revenue;
    const previousMonth = revenueStats.monthlyRevenue[revenueStats.monthlyRevenue.length - 2].revenue;
    return previousMonth !== 0 ? ((lastMonth - previousMonth) / previousMonth) * 100 : 0;
  };

  if (loading && !revenueStats) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg">Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Payment Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
              <h2 className="text-2xl font-bold">{formatCurrency(revenueStats?.totalRevenue || 0)}</h2>
            </div>
            <div className="bg-blue-100 p-2 rounded">
              <DollarSign className="text-blue-500" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 mb-1">Monthly Growth</p>
              <h2 className="text-2xl font-bold flex items-center">
                {calculateGrowth().toFixed(1)}%
                {calculateGrowth() >= 0 ? (
                  <ArrowUp className="ml-2 text-green-500" size={20} />
                ) : (
                  <ArrowDown className="ml-2 text-red-500" size={20} />
                )}
              </h2>
            </div>
            <div className="bg-green-100 p-2 rounded">
              <BarChart2 className="text-green-500" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 mb-1">Recent Payments</p>
              <h2 className="text-2xl font-bold">{revenueStats?.recentPayments.length || 0}</h2>
            </div>
            <div className="bg-purple-100 p-2 rounded">
              <CreditCard className="text-purple-500" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 mb-1">Companies</p>
              <h2 className="text-2xl font-bold">{companies.length}</h2>
            </div>
            <div className="bg-yellow-100 p-2 rounded">
              <Users className="text-yellow-500" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Revenue Trend</h2>
        <div className="h-64">
          {revenueStats?.monthlyRevenue && revenueStats.monthlyRevenue.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={revenueStats.monthlyRevenue}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex justify-center items-center h-full">
              <p className="text-gray-500">No revenue data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Payments and Company Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {/* Recent Payments */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recent Payments</h2>
          <div className="overflow-x-auto">
            {revenueStats?.recentPayments && revenueStats.recentPayments.length > 0 ? (
              <>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {revenueStats.recentPayments.map((payment) => {
                      const company = companies.find((c) => c.id === payment.companyId) || { name: 'Unknown' };
                      return (
                        <tr key={payment._id}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{company.name}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{formatCurrency(payment.amount)}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{payment.planName || 'N/A'}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                payment.status === 'succeeded' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {payment.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{formatDate(payment.paymentDate)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {/* Pagination Controls for Recent Payments */}
                <div className="mt-4 flex items-center justify-between">
                  <button
                    onClick={() => setRecentPaymentsPage((prev) => Math.max(prev - 1, 1))}
                    disabled={recentPaymentsPage === 1}
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-700">
                    Page {recentPaymentsPage} of {recentPaymentsTotalPages}
                  </span>
                  <button
                    onClick={() => setRecentPaymentsPage((prev) => Math.min(prev + 1, recentPaymentsTotalPages))}
                    disabled={recentPaymentsPage === recentPaymentsTotalPages}
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </>
            ) : (
              <div className="flex justify-center items-center h-64">
                <p className="text-gray-500">No recent payments data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Company Payments */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Company Payment History</h2>
            <select
              className="form-select rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
            >
              <option value="">Select Company</option>
              {companies.map((company) => (
                <option key={company.name} value={company.name}>{company.name}</option>
              ))}
            </select>
          </div>

          {selectedCompanyId ? (
            companyLoading ? (
              <div className="flex justify-center items-center h-64">
                <p>Loading payments...</p>
              </div>
            ) : companyPayments.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {companyPayments.map((payment) => (
                        <tr key={payment._id}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{formatCurrency(payment.amount)}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{payment.planName || 'N/A'}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                payment.status === 'succeeded' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {payment.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{formatDate(payment.paymentDate)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Pagination Controls for Company Payments */}
                <div className="mt-4 flex items-center justify-between">
                  <button
                    onClick={() => setCompanyCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={companyCurrentPage === 1}
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-700">
                    Page {companyCurrentPage} of {companyTotalPages}
                  </span>
                  <button
                    onClick={() => setCompanyCurrentPage((prev) => Math.min(prev + 1, companyTotalPages))}
                    disabled={companyCurrentPage === companyTotalPages}
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </>
            ) : (
              <div className="flex justify-center items-center h-64">
                <p>No payment history found</p>
              </div>
            )
          ) : (
            <div className="flex justify-center items-center h-64">
              <p className="text-gray-500">Select a company to view payment history</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentDashboard;