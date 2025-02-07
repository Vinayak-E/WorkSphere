import { useState, useEffect } from "react";
import { ScaleLoader } from 'react-spinners';
import { Search, X, Calendar, ChevronLeft, ChevronRight, Clock, Briefcase, Timer, CheckCircle2, Circle } from "lucide-react";
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
      console.log('updated Task',updatedTask)
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task._id === taskId ? { ...task, status: updatedTask.status } : task
        )
      );
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'Completed': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'In Progress': return <Timer className="w-4 h-4 text-blue-500" />;
      default: return <Circle className="w-4 h-4 text-gray-400" />;
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
    <Card className="w-full max-w-6xl mx-auto border-gray-200 shadow-xl rounded-xl">
    <CardHeader className="bg-gradient-to-r from-blue-100 to-blue-200 px-6 py-4 border-b-gray-50 rounded-t-xl">
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
      <div className="mb-8 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex items-center gap-2 flex-1 relative">
            <Search className="absolute left-3 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full bg-white border-gray-200 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] bg-white">
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
            className="flex items-center gap-2 hover:bg-gray-100"
          >
            <X className="w-4 h-4" /> Clear Filters
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {tasks.map((task) => (
          <Card 
            key={task._id}
            className="group hover:shadow-lg transition-all duration-300 border-gray-100 hover:border-blue-100 relative overflow-hidden"
          >
            <div className={`absolute top-0 left-0 w-1 h-full ${
              task.priority === 'High' ? 'bg-red-500' :
              task.priority === 'Medium' ? 'bg-yellow-500' :
              'bg-green-500'
            }`} />
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4 gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(task.status)}
                    <span className="text-sm font-medium text-gray-500">{task.status}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">
                    {task.title}
                  </h3>
                </div>
                <Select
                  value={task.status}
                  onValueChange={(value) => handleStatusChange(task._id, value)}
                  disabled={task.status === 'Completed'}
                >
                  <SelectTrigger className="w-[140px] bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {task.status === 'To Do' && (
                      <>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </>
                    )}
                    {task.status === 'In Progress' && (
                      <SelectItem value="Completed">Completed</SelectItem>
                    )}
                    <SelectItem value={task.status} disabled>{task.status}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <p className="text-gray-600 text-sm mb-6 line-clamp-2">{task.description}</p>
              
              <div className="flex flex-wrap gap-4 items-center text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Briefcase className="w-4 h-4 text-gray-400" />
                  <span>{task.project.name}</span>
                </div>
                <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-medium">
                  {new Date(task.deadline).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
                {task.deadline && (
                  <div className="flex items-center gap-2 ml-auto">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className={`${
                      getDaysRemaining(task.deadline) < 0 
                        ? 'text-red-600 font-medium' 
                        : getDaysRemaining(task.deadline) < 7 
                          ? 'text-yellow-600 font-medium' 
                          : 'text-gray-600'
                    }`}>
                      {getDaysRemaining(task.deadline) < 0 
                        ? 'Overdue' 
                        : `${getDaysRemaining(task.deadline)} days left`}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {tasks.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-2">No tasks found</div>
          <p className="text-sm text-gray-500">Try adjusting your filters or search query</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="min-w-[100px] bg-white hover:bg-gray-100"
            >
              <ChevronLeft className="w-4 h-4 mr-2" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="min-w-[100px] bg-white hover:bg-gray-100"
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