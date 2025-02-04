import { useState, useEffect } from "react";
import { ScaleLoader } from 'react-spinners';
import { Search, X, Calendar, ChevronLeft, ChevronRight, Clock, Briefcase } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDebounce } from "@/hooks/useDebounce";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { IEmployee } from "@/types/IEmployee";
import { ProfileService } from "@/services/employee/employee.service";

interface ITask {
  _id: string;
  title: string;
  description: string;
  project: {
    _id: string;
    name: string;
  };
  status: 'To Do' | 'In Progress' | 'Completed';
  priority: 'Low' | 'Medium' | 'High';
  deadline: Date;
}

function isEmployee(userData: unknown): userData is IEmployee {
  return !!userData && typeof userData === 'object' && 'role' in userData;
}

const EmployeeTaskList = () => {
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const tasksPerPage = 6;
  
  const { user } = useSelector((state: RootState) => state.auth);
  const employeeData = user?.userData;
  const employeeId = isEmployee(employeeData) ? employeeData._id : undefined;

  const debouncedSearch = useDebounce(searchQuery, 500);

  useEffect(() => {
    const loadTasks = async () => {
      if (!employeeId) return;
      
      setIsLoading(true);
      try {
        const response = await ProfileService.getEmployeeTasks({
          employeeId,
          page: currentPage,
          limit: tasksPerPage,
          search: debouncedSearch,
          status: statusFilter !== 'all' ? statusFilter : undefined
        });
        
        setTasks(response.data);
        setTotalPages(response.totalPages);
      } catch (error) {
        console.error('Error loading tasks:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadTasks();
  }, [currentPage, debouncedSearch, statusFilter, employeeId]);

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const updatedTask = await ProfileService.updateTaskStatus(taskId, newStatus);
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task._id === taskId ? { ...task, status: updatedTask.status } : task
        )
      );
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const getDaysRemaining = (deadline: Date) => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const timeDiff = deadlineDate.getTime() - now.getTime();
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <ScaleLoader color="#3B82F6"/>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-6xl mx-auto shadow-lg rounded">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-600" />
              My Tasks
            </CardTitle>
            <p className="text-sm text-gray-500">View and manage your assigned tasks</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="mb-6 bg-gray-50 p-4 rounded-xl shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex items-center gap-2 flex-1">
              <Search className="text-gray-500 w-5 h-5" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="To Do">To Do</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
              }}
              className="flex items-center gap-2"
            >
              <X className="w-4 h-4" /> Clear Filters
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {tasks.map((task) => (
            <Card 
              key={task._id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {task.title}
                  </h3>
                  <Select
                    value={task.status}
                    onValueChange={(value) => handleStatusChange(task._id, value)}
                    disabled={task.status === 'Completed'} // disable if completed
                    >
                    <SelectTrigger className="w-[140px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {/* If task is "To Do", allow both "In Progress" and "Completed" */}
                        {task.status === 'To Do' && (
                        <>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                        </>
                        )}
                        {/* If task is "In Progress", allow only "Completed" */}
                        {task.status === 'In Progress' && (
                        <SelectItem value="Completed">Completed</SelectItem>
                        )}
                        {/* You can also choose to display the current status as a disabled option */}
                        <SelectItem value={task.status} disabled>
                        {task.status}
                        </SelectItem>
                    </SelectContent>
                    </Select>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{task.description}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-gray-400" />
                    <span>{task.project.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      task.priority === 'High' ? 'bg-red-100 text-red-800' :
                      task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {task.priority} Priority
                    </span>
                  </div>
                  {task.deadline && (
                    <div className="flex items-center gap-2 col-span-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className={`${
                        getDaysRemaining(task.deadline) < 0 
                          ? 'text-red-600' 
                          : getDaysRemaining(task.deadline) < 7 
                            ? 'text-yellow-600' 
                            : 'text-gray-600'
                      }`}>
                        {getDaysRemaining(task.deadline) < 0 
                          ? 'Overdue' 
                          : `${getDaysRemaining(task.deadline)} days remaining`}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {tasks.length === 0 && !isLoading && (
          <div className="text-center py-12 text-gray-500">
            No tasks found
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-gray-50 p-4 rounded-lg">
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
        )}
      </CardContent>
    </Card>
  );
};

export default EmployeeTaskList;