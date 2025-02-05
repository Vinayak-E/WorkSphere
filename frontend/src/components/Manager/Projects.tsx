import { useState, useEffect } from "react";
import { ScaleLoader } from 'react-spinners';
import { useNavigate } from "react-router-dom";
import { PlusCircle, X, Calendar, ChevronLeft, ChevronRight, Search, Clock, Users, Building, ChevronDown, Pencil, CheckCircle, AlertCircle } from "lucide-react";
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
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };


  useEffect(() => {
    if (!isOpen) {
      setEditedProject(null);
      setNewProject({ name: "", description: "", status: "Pending", deadline: "" });
    } else if (editedProject) {
      setNewProject({
        name: editedProject.name,
        description: editedProject.description,
        status: editedProject.status,
        deadline: editedProject.deadline ? new Date(editedProject.deadline).toISOString().split('T')[0] : ""
      });
    }
  }, [isOpen, editedProject]);



  const getDaysRemaining = (deadline: string | Date) => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const timeDiff = deadlineDate.getTime() - now.getTime();
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  };


  const handleProjectClick = (projectId: string) => {
    if (!projectId) {
      console.error("Project ID is undefined");
      return;
    }
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
    <Card className="w-full max-w-6xl mx-auto shadow-lg rounded">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b">
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
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <Input
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    required
                    className="focus:ring-2 focus:ring-blue-500"
                  />
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
            <div className="flex items-center gap-2 flex-1 w-full">
              <Search className="text-gray-500 w-5 h-5" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full focus:ring-2 focus:ring-blue-500"
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {projects.map((project) => (
            <Card
              key={project._id}
              className="hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => handleProjectClick(project._id)}
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                    {project.name}
                  </h3>
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

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditedProject(project);
                        setIsOpen(true);
                      }}
                    >
                      <Pencil className="w-4 h-4 text-gray-500 hover:text-blue-600" />
                    </Button>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-gray-400" />
                    <span>{project.department?.name || 'No Department'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>{project.employees?.length || 0} members</span>
                  </div>
                  {project.deadline && (
                    <div className="flex items-center gap-2 col-span-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className={`${getDaysRemaining(project.deadline) < 0
                          ? 'text-red-600'
                          : getDaysRemaining(project.deadline) < 7
                            ? 'text-yellow-600'
                            : 'text-gray-600'
                        }`}>
                        {getDaysRemaining(project.deadline) < 0
                          ? 'Overdue'
                          : `${getDaysRemaining(project.deadline)} days remaining`}
                      </span>
                    </div>
                  )}
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