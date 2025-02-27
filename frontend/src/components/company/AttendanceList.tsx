import { useState, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import api from "@/api/axios";

const AttendanceList = () => {
  const [attendance, setAttendance] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        date: date,
      });
      const response = await api.get(`/company/attendance?${queryParams}`);
      const data = await response.data;
      setAttendance(data.attendance);
      setTotalPages(Math.ceil(data.total / 10));
    } catch (error) {
      console.error("Error fetching attendance:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAttendance();
  }, [currentPage, date]);

  const formatTime = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatWorkHours = (hours) => {
    if (!hours) return "0h 0m";

    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);

    return `${wholeHours}h ${minutes}m`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Present":
        return "bg-green-100 text-green-800";
      case "Absent":
        return "bg-red-100 text-red-800";
      case "On Leave":
        return "bg-yellow-100 text-yellow-800";
      case "Half Day Leave":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="w-full max-w-6xl mx-auto border-gray-200 shadow-xl rounded-xl mt-6">
      <CardHeader className="bg-gradient-to-r from-blue-100 to-blue-200 px-6 py-4 border-b-gray-50 rounded-t-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-600" />
              Attendance List
            </CardTitle>
            <CardDescription className="text-sm text-gray-500">
              Monitor employee attendance and working hours
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Filter Section */}
        <div className="mb-6 bg-gray-50 p-4 rounded-xl shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex items-center gap-3 flex-1">
              <Filter className="text-gray-500 w-5 h-5" />
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full md:w-auto focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Button
                variant="outline"
                onClick={() => setDate(new Date().toISOString().split("T")[0])}
                className="flex items-center gap-2 w-full md:w-auto"
              >
                <X className="w-4 h-4" /> Reset to Today
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
                    "Employee ID",
                    "Employee",
                    "Check In",
                    "Check Out",
                    "Total Hours",
                    "Status",
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
                {attendance.map((record) => (
                  <tr
                    key={record._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      {record.employeeId.employeeId}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                          {record.employeeId?.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {record.employeeId?.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      {formatTime(record.checkInTime)}
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      {formatTime(record.checkOutTime)}
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      {formatWorkHours(record.totalWorkedTime)}
                    </td>
                    <td className="px-4 py-3">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}
                            >
                              {record.status}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              {record.totalWorkedTime >= 480
                                ? "Full day completed"
                                : "Partial day"}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {loading && (
            <div className="p-4 text-center text-gray-500">
              Loading attendance records...
            </div>
          )}

          {!loading && attendance.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              No attendance records found
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
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="min-w-[100px]"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
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

export default AttendanceList;
