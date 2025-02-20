import { useState, useEffect } from "react";
import { ScaleLoader } from 'react-spinners';
import { useNavigate } from "react-router-dom";
import { PlusCircle, X, Calendar, ChevronLeft, ChevronRight, Search, Clock, Users, Building, Pencil, AlertCircle, ArrowRight, CalendarIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectController } from "@/controllers/employee/project.controller";
import { ICreateProject, IProject } from "@/types/IProject";
import { useDebounce } from "@/hooks/useDebounce";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { IEmployee } from "@/types/IEmployee";
import ProjectStatusDropdown from "./ProjectStatusDropdown";
import { ProjectService } from "@/services/employee/project.service";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

function isEmployee(userData: unknown): userData is IEmployee {
  return !!userData && typeof userData === 'object' && 'role' in userData;
}

const ProjectList = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [projects, setProjects] = useState<IProject[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const projectsPerPage = 6;
  const { user } = useSelector((state: RootState) => state.auth);
  const employeeData = user?.userData;
  const employeeId = isEmployee(employeeData) ? employeeData._id : undefined;
  const [newProject, setNewProject] = useState<ICreateProject>({
    name: "",
    description: "",
    status: "Pending",
    deadline: ""
  });

  const debouncedSearch = useDebounce(searchQuery, 500);

  useEffect(() => {
    const loadProjects = async () => {
      setIsLoading(true);
      try {
        const { data, totalPages } = await ProjectController.getProjects({
          page: currentPage,
          limit: projectsPerPage,
          search: debouncedSearch,
          employeeId: employeeId
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
  }, [currentPage, debouncedSearch, employeeId]);

  const [editedProject, setEditedProject] = useState<IProject | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Clear previous errors
    setFormErrors({});
    try {
      if (editedProject) {
        const updatedProject = await ProjectController.updateProject(
          editedProject._id,
          newProject
        );
        setProjects(projects.map(p => p._id === updatedProject._id ? updatedProject : p));
      } else {
        const createdProject = await ProjectController.createProject(newProject, employeeId);
        setProjects([createdProject, ...projects]);
      }
      setIsOpen(false);
      setNewProject({ name: "", description: "", status: "Pending", deadline: "" });
      setEditedProject(null);
    } catch (error: any) {
      
      try {
        const validationErrors = JSON.parse(error.message);

        const newErrors: Record<string, string> = {};
        validationErrors.forEach((err: { path: string; message: string }) => {
          newErrors[err.path] = err.message;
        });
        setFormErrors(newErrors);
      } catch {
        console.error('Error saving project:', error);
      }
    }
  };


  useEffect(() => {
    if (!isOpen) {
      setEditedProject(null);
      setNewProject({ name: "", description: "", status: "Pending", deadline: "" });
      setFormErrors({});
    } else if (editedProject) {
      setNewProject({
        name: editedProject.name,
        description: editedProject.description,
        status: editedProject.status,
        deadline: editedProject.deadline ? new Date(editedProject.deadline).toISOString().split('T')[0] : ""
      });
      setFormErrors({});
    }
  }, [isOpen, editedProject]);



  const getDaysRemaining = (deadline: string | Date) => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const timeDiff = deadlineDate.getTime() - now.getTime();
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  };


  const handleViewDetails = (projectId: string) => {
    navigate(`/employee/projects/${projectId}`);
  };



  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <ScaleLoader color="#3B82F6" />
      </div>
    );
  }



  return (
    <Card className="w-full max-w-6xl mx-auto border-gray-200 shadow-xl rounded-xl mt-6">
      <CardHeader className="bg-gradient-to-r from-blue-100 to-blue-200 px-6 py-4 border-b-gray-50 rounded-t-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-600" />
              Project Management
            </CardTitle>
            <p className="text-sm text-gray-500">Track and manage your projects effectively</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="shadow-md hover:shadow-lg transition-shadow">
                <PlusCircle size={18} className="mr-2" /> New Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-lg">  {editedProject ? "Edit Project" : "Create New Project"} </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Project Name</label>
                  <Input
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    required
                    className="focus:ring-2 focus:ring-blue-500"
                  />
                    {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <Input
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    required
                    className="focus:ring-2 focus:ring-blue-500"
                  />
                   {formErrors.description && <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Deadline</label>
                  <Input
                    type="date"
                    value={newProject.deadline}
                    onChange={(e) => setNewProject({ ...newProject, deadline: e.target.value })}
                    required
                    className="focus:ring-2 focus:ring-blue-500"
                    min={new Date().toISOString().split('T')[0]}
                  />
                  {newProject.deadline && new Date(newProject.deadline) < new Date() && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      Deadline cannot be in the past
                    </p>
                  )}
                   {formErrors.deadline && <p className="text-red-500 text-sm mt-1">{formErrors.deadline}</p>}
                </div>
                <Button type="submit" className="w-full">
                  {editedProject ? "Edit Project" : "Create New Project"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="mb-6 bg-gray-50 p-4 rounded-xl shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex items-center gap-2 flex-1 w-full relative">
              <Search className="absolute left-3 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full bg-white border-gray-200 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setSearchQuery("")}
              className="flex items-center gap-2 w-full md:w-auto"
            >
              <X className="w-4 h-4" /> Clear
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 ">
          {projects.map((project) => (
            <Card
              key={project._id}
              className="hover:shadow-md transition-all duration-500 border-gray-200 rounded-xl"
            >
              <CardContent className="p-6 rounded-xl">
                <div className="flex flex-col space-y-4">
                  {/* Header Section */}
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {project.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <ProjectStatusDropdown
                        status={project.status}
                        onStatusChange={async (newStatus) => {
                          try {
                            const updatedProject = await ProjectService.updateProjectStatus(project._id, newStatus);
                            setProjects(prevProjects => prevProjects.map(p =>
                              p._id === project._id ? { ...p, status: updatedProject.status } : p
                            ));
                          } catch (error) {
                            console.error('Error updating status:', error);
                          }
                        }}
                      />
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditedProject(project);
                              setIsOpen(true);
                            }}
                          >
                            <Pencil className="w-4 h-4 text-gray-500 hover:text-white" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit Project</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm line-clamp-2">
                    {project.description}
                  </p>


                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-gray-400" />
                      <span className="truncate">{project.department?.name || 'No Department'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span>{project.employees?.length || 0} members</span>
                    </div>
                    {project.deadline && (
                      <>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span
                            className={
                              getDaysRemaining(project.deadline) < 0
                                ? 'text-red-600 font-medium'
                                : getDaysRemaining(project.deadline) < 7
                                  ? 'text-yellow-600 font-medium'
                                  : 'text-gray-600'
                            }
                          >
                            {getDaysRemaining(project.deadline) < 0
                              ? 'Overdue'
                              : `${getDaysRemaining(project.deadline)} days remaining`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">

                          <CalendarIcon className="w-4 h-4 text-gray-400" />
                          <span>{new Date(project.deadline).toLocaleDateString('en-GB')}</span>
                        </div>
                      </>
                    )}
                  </div>



                  <Button variant='ghost'
                    className="w-full mt-4 rounded-[5px]  bg-primary/20 text-blue-700 hover:bg-primary transition-colors"
                    onClick={() => handleViewDetails(project._id)}
                  >
                    View Details <ArrowRight className="w-4 h-4 ml-2" />

                  </Button>

                </div>
              </CardContent>
            </Card>
          ))}
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

