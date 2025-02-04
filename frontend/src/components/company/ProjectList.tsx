import { useState, useEffect } from "react";

import {  X, Calendar, ChevronLeft, ChevronRight, Search, Clock, Users, ListTodo, AlertCircle, BadgeInfo, CheckCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProjectController } from "@/controllers/employee/project.controller";
import { IProject } from "@/types/IProject";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";

const ProjectList = () => {

  const [projects, setProjects] = useState<IProject[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const projectsPerPage = 6;

  const debouncedSearch = useDebounce(searchQuery, 500);

  useEffect(() => {
    const loadProjects = async () => {
      setIsLoading(true);
      try {
        const { data, totalPages } = await ProjectController.getAllProjects({
          page: currentPage,
          limit: projectsPerPage,
          search: debouncedSearch,
          status: selectedStatus !== "all" ? selectedStatus : undefined,
          department: selectedDepartment !== "all" ? selectedDepartment : undefined
        });
        setProjects(data);
        setTotalPages(totalPages);
      } catch (error) {
        console.error('Error loading projects:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadProjects();
  }, [currentPage, debouncedSearch, selectedStatus, selectedDepartment]);

  const getStatusDetails = (status: string) => {
    const statusMap: { [key: string]: { color: string; icon: JSX.Element } } = {
      Completed: { color: "bg-green-500", icon: <CheckCircle className="w-4 h-4" /> },
      "In Progress": { color: "bg-blue-500", icon: <BadgeInfo className="w-4 h-4" /> },
      Pending: { color: "bg-yellow-500", icon: <AlertCircle className="w-4 h-4" /> }
    };
    return statusMap[status] || { color: "bg-gray-500", icon: <AlertCircle className="w-4 h-4" /> };
  };

  const calculateProgress = (project: IProject) => {
    if (!project.deadline || !project.createdAt) return 0;
    if(project.status == 'Completed')return 100
    const start = new Date(project.createdAt).getTime();
    const end = new Date(project.deadline).getTime();
    const now = Date.now();
    const total = end - start;
    const progress = now - start;
    return Math.min(Math.max((progress / total) * 100, 0), 100);
  };


  return (
    <Card className="w-full max-w-7xl mx-auto shadow-lg rounded-xl">
      <CardHeader className="bg-gradient-to-r from-blue-100 to-indigo-100 px-8 py-6 border-b">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <Calendar className="w-8 h-8 text-indigo-600" />
              Company Projects
            </CardTitle>
            <p className="text-sm text-gray-600">Overview of all company initiatives and their progress</p>
          </div>
     
        </div>
      </CardHeader>

      <CardContent className="p-8">
        <div className="mb-8 bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex items-center gap-3 flex-1 w-full">
              <Search className="text-gray-500 w-6 h-6" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-lg py-6 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <Button 
              variant="outline" 
              onClick={() => setSearchQuery("")}
              className="h-11 px-6 flex items-center gap-2"
            >
              <X className="w-5 h-5" /> Clear
            </Button>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {/* Populate with actual departments */}
                <SelectItem value="engineering">Engineering</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="hr">Human Resources</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {projects.map((project) => {
            const statusDetails = getStatusDetails(project.status);
            const progress = calculateProgress(project);
            
            return (
              <Card 
                key={project._id}
                className="hover:shadow-xl transition-shadow cursor-pointer group border-0 shadow-sm relative overflow-hidden"
              >
                <div className={cn(
                  "absolute top-0 left-0 w-2 h-full",
                  statusDetails.color
                )} />
                
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">
                      {project.name}
                    </h3>
                    <span className="flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-opacity-20 bg-indigo-500 text-indigo-800">
                      {statusDetails.icon}
                      {project.status}
                    </span>
                  </div>

                  <div className="mb-4 flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                      {project.department?.name || 'No Department'}
                    </span>
                    {project.manager && (
                      <span className="bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full">
                        Manager: {project.manager.name}
                      </span>
                    )}
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{project.description}</p>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Progress</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-2 bg-gray-200" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-gray-400" />
                        <span>{project.employees?.length || 0} Members</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ListTodo className="w-5 h-5 text-gray-400" />
                        <span>{project.tasks?.length || 0} Tasks</span>
                      </div>
                      {project.deadline && (
                        <div className="col-span-2 flex items-center gap-2">
                          <Clock className="w-5 h-5 text-gray-400" />
                          <span className={cn(
                            "font-medium",
                            new Date(project.deadline) < new Date() 
                              ? 'text-red-600' 
                              : 'text-gray-600'
                          )}>
                            Deadline: {new Date(project.deadline).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        {projects.length === 0 && !isLoading && (
          <div className="text-center py-12 text-gray-500">
            No projects found
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

export default ProjectList;