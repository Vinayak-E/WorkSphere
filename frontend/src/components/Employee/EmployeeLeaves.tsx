import  { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Plus, Filter, X, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from '@/api/axios';

const EmployeeLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  
  const [leaveForm, setLeaveForm] = useState({
    startDate: '',
    endDate: '',
    reason: '',
  });

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        startDate: startDate,
        endDate: endDate,
      });
      const response = await api.get(`/employee/leaves?${queryParams}`)

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/employee/leaves', leaveForm)
  
      if (response.data.success) {
        setIsOpen(false);
        fetchLeaves();
        setLeaveForm({ startDate: '', endDate: '', reason: '' });
      }
    } catch (error) {
      console.error('Error applying for leave:', error);
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

  return (
    <Card className="w-full max-w-6xl mx-auto shadow-lg rounded">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-600" />
              Leave Management
            </CardTitle>
            <p className="text-sm text-gray-500">View and manage your leave applications</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="shadow-md hover:shadow-lg transition-shadow">
                <Plus size={18} className="mr-2" /> New Leave Request
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-lg">New Leave Application</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Start Date</label>
                  <Input
                    type="date"
                    value={leaveForm.startDate}
                    onChange={(e) => setLeaveForm({...leaveForm, startDate: e.target.value})}
                    required
                    className="focus:ring-2 focus:ring-blue-500"
                    min={new Date().toISOString().split("T")[0]}
                  />
                 {leaveForm.startDate &&
                  new Date(leaveForm.startDate).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0) && (
                    <div className="text-red-500">Start Date cannot be in the past</div>
                )}
                  
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">End Date</label>
                  <Input
                    type="date"
                    value={leaveForm.endDate}
                    onChange={(e) => setLeaveForm({...leaveForm, endDate: e.target.value})}
                    required
                    min={leaveForm.startDate || new Date().toISOString().split("T")[0]} 
                    className="focus:ring-2 focus:ring-blue-500"
                  />
                  {leaveForm.endDate &&
                  new Date(leaveForm.endDate).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0) && (
                    <div className="text-red-500">End Date cannot be in the past</div>
                )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Reason</label>
                  <Input
                    value={leaveForm.reason}
                    onChange={(e) => setLeaveForm({...leaveForm, reason: e.target.value})}
                    required
                    placeholder="Enter leave reason..."
                    className="focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                  Submit Application
                </Button>
              </form>
            </DialogContent>
          </Dialog>
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

        {/* Leaves Table */}
        <div className="border rounded-md overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {['Start Date', 'End Date', 'Reason', 'Status', 'Applied On'].map((header) => (
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
                {leaves.map((leave, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                    {new Date(leave.startDate).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      {new Date(leave.endDate).toLocaleDateString('en-GB')}
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

export default EmployeeLeaves;