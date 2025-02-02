import { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Plus, Filter, X, Check, X as Cross } from 'lucide-react';
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import api from '@/api/axios';

const LeaveManagement = () => {
  const [leaves, setLeaves] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        startDate: startDate,
        endDate: endDate,
      });
      const response = await api.get(`/company/leaves?${queryParams}`);
      console.log("response.data",response.data)
      const data = await response.data;
      setLeaves(data.leaves);
      setTotalPages(Math.ceil(data.total / 10));
    } catch (error) {
      console.error('Error fetching leaves:', error);
    }
    setLoading(false);
  };
   
  useEffect(() => {
    fetchLeaves();
  }, [currentPage, startDate, endDate]);

  const handleStatusUpdate = async (leaveId, status) => {
    try {
      await api.patch(`/company/leaves/${leaveId}`, { status });
      toast.success(`Leave ${status} successfully!`);
      fetchLeaves();
    } catch (error) {
      console.error('Error updating leave status:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  return (
    <Card className="w-full max-w-7xl mx-auto shadow-lg rounded">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-600" />
                Leave Management
            </CardTitle>
            <p className="text-sm text-gray-500">Review and manage employee leave requests</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Filter Section */}
        <div className="mb-6 bg-gray-50 p-4 rounded-xl shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex items-center gap-3 flex-1 w-full">
              <Filter className="text-gray-500 w-5 h-5" />
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full md:w-auto focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-400 hidden md:inline">–</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full md:w-auto focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Button 
                variant="outline" 
                onClick={() => { setStartDate(''); setEndDate('') }}
                className="flex items-center gap-2 w-full md:w-auto"
              >
                <X className="w-4 h-4" /> Clear Filters
              </Button>
            </div>
          </div>
        </div>

 
        <div className="border rounded-md overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    'Employee ID',
                    'Employee',
                    'Start Date',
                    'End Date',
                    'Duration',
                    'Reason',
                    'Status',
                    'Applied On',
                    'Actions'
                  ].map((header) => (
                    <th 
                      key={header} 
                      className="px-4 py-3 text-left text-sm font-semibold text-gray-600 whitespace-nowrap"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {leaves.map((leave) => (
                  <tr key={leave._id} className="hover:bg-gray-50 transition-colors">

                       <td className="px-4 py-3 text-sm whitespace-nowrap">
                      {leave.employeeId.employeeId}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                          {leave.employeeId?.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {leave.employeeId?.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      {new Date(leave.startDate).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      {new Date(leave.endDate).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      {calculateDuration(leave.startDate, leave.endDate)} days
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate">
                      {leave.reason}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(leave.status)}`}>
                        {leave.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      {new Date(leave.appliedAt).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-4 py-3">
                      {leave.status === 'Pending' && (
                        <div className="flex gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="bg-green-50 hover:bg-green-100 text-green-600 border-green-200"
                                  onClick={() => handleStatusUpdate(leave._id, 'Approved')}
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Approve Leave</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
                                  onClick={() => handleStatusUpdate(leave._id, 'Rejected')}
                                >
                                  <Cross className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Reject Leave</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {loading && (
            <div className="p-4 text-center text-gray-500">
              Loading leaves...
            </div>
          )}

          {!loading && leaves.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              No leave applications found
            </div>
          )}

          <div className="px-4 py-3 border-t bg-gray-50">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="min-w-[100px]"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="min-w-[100px]"
                >
                  Next <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LeaveManagement;