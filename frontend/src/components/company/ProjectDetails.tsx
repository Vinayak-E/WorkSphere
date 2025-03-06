import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ScaleLoader } from "react-spinners";
import {
  Users,
  Clock,
  Briefcase,
  ListChecks,
  BarChart2,
  CheckCircle,
  AlertCircle,
  BadgeInfo,
  PencilIcon,
  UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { IProject, ITask } from "@/types/IProject";
import { ProjectService } from "@/services/employee/project.service";
import { cn } from "@/lib/utils";
import EditProjectModal from "./EditProjectModal";

const CompanyProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<IProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [departmentEmployees, setDepartmentEmployees] = useState([]);
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const loadProject = async () => {
      try {
        const response = await ProjectService.getProjectById(id!);
        setProject(response.data);
        setTasks(response.data.tasks);
        setDepartmentEmployees(response.data.departmentEmployees);
      } catch (error) {
        navigate("/company/projects");
      } finally {
        setIsLoading(false);
      }
    };
    loadProject();
  }, [id]);

  const getStatusDetails = (status: string) => {
    const statusMap: {
      [key: string]: { color: string; bgColor: string; icon: JSX.Element };
    } = {
      Completed: {
        color: "text-green-700",
        bgColor: "bg-green-50",
        icon: <CheckCircle className="w-5 h-5" />,
      },
      "In Progress": {
        color: "text-blue-700",
        bgColor: "bg-blue-50",
        icon: <BadgeInfo className="w-5 h-5" />,
      },
      Pending: {
        color: "text-yellow-700",
        bgColor: "bg-yellow-50",
        icon: <AlertCircle className="w-5 h-5" />,
      },
    };
    return (
      statusMap[status] || {
        color: "text-gray-700",
        bgColor: "bg-gray-50",
        icon: <AlertCircle className="w-5 h-5" />,
      }
    );
  };

  const calculateProgress = (project: IProject) => {
    // First check if project is explicitly marked as completed
    if (project.status === "Completed") return 100;

    // Task-based progress calculation
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(
      (task) => task.status === "Completed",
    ).length;

    if (totalTasks > 0) {
      return Math.round((completedTasks / totalTasks) * 100);
    }

    // Fallback to timeline-based calculation
    if (!project.deadline || !project.createdAt) return 0;

    const start = new Date(project.createdAt).getTime();
    const end = new Date(project.deadline).getTime();
    const now = Date.now();

    return Math.min(Math.max(((now - start) / (end - start)) * 100, 0), 100);
  };

  const handleProjectUpdate = (updatedProject: IProject) => {
    setProject(updatedProject);
  };
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <ScaleLoader color="#4F46E5" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Button variant="outline" onClick={() => navigate(-1)} className="mb-6">
          ← Back to Projects
        </Button>
        <Card className="text-center p-6">
          <p className="text-gray-600">Project not found</p>
        </Card>
      </div>
    );
  }

  const statusDetails = getStatusDetails(project.status);
  const progress = calculateProgress(project);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
        >
          ← Back to Projects
        </Button>
        <span
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium",
            statusDetails.color,
            statusDetails.bgColor,
          )}
        >
          {statusDetails.icon}
          {project.status}
        </span>
      </div>

      <Card className="w-full max-w-6xl mx-auto border-gray-200 shadow-xl rounded-xl">
        <CardHeader className="bg-gradient-to-r from-blue-100 to-blue-200 px-6 py-4 border-b-gray-50 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <Briefcase className="w-8 h-8 text-blue-400" />
                {project.name}
              </CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <UserIcon className="w-5 h-5 text-gray-500" />
                <span className="text-md font-medium text-gray-700">
                  {project.manager.name}
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="p-2 rounded-full hover:bg-blue-200 transition focus:outline-none"
              aria-label="Edit project details"
            >
              <PencilIcon className="w-6 h-6 text-gray-600" />
            </button>
          </div>
          <p className="text-gray-500 text-md mt-4">{project.description}</p>
        </CardHeader>

        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Project Overview
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-5 h-5" />
                      <span>Deadline</span>
                    </div>
                    <p className="text-lg font-medium">
                      {new Date(project.deadline).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-5 h-5" />
                      <span>Team Size</span>
                    </div>
                    <p className="text-md font-medium">
                      {project.employees?.length || 0} Members
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <ListChecks className="w-5 h-5" />
                      <span>Tasks</span>
                    </div>
                    <p className="text-md font-medium">
                      {tasks.filter((t) => t.status === "Completed").length} /{" "}
                      {tasks.length} Completed
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <BarChart2 className="w-5 h-5" />
                      <span>Progress</span>
                    </div>
                    <p className="text-lg font-medium">
                      {Math.round(progress)}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Project Progress
                </h3>
                <Progress
                  value={progress}
                  className="h-3 bg-gray-200"
                  indicatorClassName={cn(
                    "transition-all rounded-full",
                    progress === 100 ? "bg-green-500" : "bg-indigo-500",
                  )}
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>
                    Start: {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                  <span>
                    End: {new Date(project.deadline).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center justify-between">
                  Project Tasks
                  <span className="text-sm text-gray-600">
                    {tasks?.length || 0} Tasks
                  </span>
                </h3>
                <div className="space-y-4">
                  {tasks?.map((task) => (
                    <Card key={task._id} className="border border-gray-200">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <h4 className="font-medium text-gray-900">
                            {task.title}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {task.description}
                          </p>
                          <div className="flex justify-between items-center text-sm text-gray-500 pt-2">
                            <span className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              {typeof task.assignee === "object"
                                ? task.assignee.name
                                : departmentEmployees.find(
                                    (emp) => emp._id === task.assignee,
                                  )?.name || task.assignee}
                            </span>
                            <span className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              {new Date(task.deadline).toLocaleDateString()}
                            </span>
                            <h4 className="font-medium text-gray-900">
                              {task.status}
                            </h4>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <EditProjectModal
        project={project}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        departmentEmployees={departmentEmployees}
        onProjectUpdated={handleProjectUpdate}
      />
    </div>
  );
};

export default CompanyProjectDetails;
