import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ScaleLoader } from "react-spinners";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectService } from "@/services/employee/project.service";
import { IProject, ITask } from "@/types/IProject";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Clock,
  Briefcase,
  ListChecks,
  PlusCircle,
  Pencil,
} from "lucide-react";
import { ProjectController } from "@/controllers/employee/project.controller";

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<IProject | null>(null);
  const [departmentEmployees, setDepartmentEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ITask | null>(null);
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assignee: "",
    deadline: "",
  });
  const [editTask, setEditTask] = useState({
    title: "",
    description: "",
    assignee: "",
    deadline: "",
  });

  useEffect(() => {
    const loadProject = async () => {
      try {
        const response = await ProjectService.getProjectById(id!);
        setProject(response.data);
        console.log('response',response)
        setDepartmentEmployees(response.data.departmentEmployees);
        setTasks(response.data.tasks);
      } catch (error) {
        console.error("Error loading project:", error);
        navigate("/employee/projects");
      } finally {
        setIsLoading(false);
      }
    };
    loadProject();
  }, [id]);

  const handleCreateTask = async () => {
    try {
      const createdTask = (await ProjectController.createTask(
        id!,
        newTask,
      )) as ITask;
      const formattedTask = {
        _id: createdTask._id,
        title: createdTask.title,
        description: createdTask.description,
        assignee: createdTask.assignee,
        deadline: createdTask.deadline,
        status: createdTask.status,
      };

      setTasks((prevTasks) => [...prevTasks, formattedTask]);

      setIsCreateDialogOpen(false);
      setNewTask({
        title: "",
        description: "",
        assignee: "",
        deadline: "",
      });
    } catch (error: any) {
      // Attempt to parse validation errors
      try {
        const validationErrors = JSON.parse(error.message);
        // Create an object with field names as keys and error messages as values.
        const newErrors: Record<string, string> = {};
        validationErrors.forEach((err: { path: string; message: string }) => {
          newErrors[err.path] = err.message;
        });
        setFormErrors(newErrors);
      } catch {
        console.error("Error saving project:", error);
      }
    }
  };

  const handleEditClick = (task: ITask) => {
    setSelectedTask(task);
    setEditTask({
      title: task.title,
      description: task.description,
      assignee:
        typeof task.assignee === "object" ? task.assignee._id : task.assignee,
      deadline: new Date(task.deadline).toISOString().split("T")[0],
    });
    setFormErrors({});
    setIsEditDialogOpen(true);
  };

  const handleUpdateTask = async () => {
    if (!selectedTask) return;

    try {
      const updatedTask = await ProjectController.updateTask(
        id!,
        selectedTask._id,
        editTask,
      );

      // Update the tasks state directly
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === selectedTask._id ? { ...task, ...updatedTask } : task,
        ),
      );

      setIsEditDialogOpen(false);
      setSelectedTask(null);
    } catch (error: any) {
      // Attempt to parse validation errors
      try {
        const validationErrors = JSON.parse(error.message);
        // Create an object with field names as keys and error messages as values.
        const newErrors: Record<string, string> = {};
        validationErrors.forEach((err: { path: string; message: string }) => {
          newErrors[err.path] = err.message;
        });
        setFormErrors(newErrors);
      } catch {
        console.error("Error saving project:", error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <ScaleLoader color="#3B82F6" />
      </div>
    );
  }

  if (!project) {
    return <div>Project not found</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Button variant="outline" onClick={() => navigate(-1)} className="mb-6">
        &larr; Back to Projects
      </Button>

      <Card className="mb-6">
        <CardHeader className="bg-blue-50">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl font-bold flex items-center gap-3">
                <Briefcase className="w-8 h-8 text-blue-600" />
                {project.name}
              </CardTitle>
              <p className="text-gray-600 mt-2">{project.description}</p>
            </div>
            <Button
              onClick={() => {
                setIsCreateDialogOpen(true);
                setFormErrors({});
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Assign Task
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-600" />
              <span className="font-medium">
                Deadline:{" "}
                {new Date(project.deadline).toLocaleDateString("en-GB")}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-gray-600" />
              <span className="font-medium">
                Team Members: {project.employees?.length || 0}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <ListChecks className="w-5 h-5 text-gray-600" />
              <span className="font-medium">
                Total Tasks: {tasks?.length || 0}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  project.status === "Completed"
                    ? "bg-green-100 text-green-800"
                    : project.status === "In Progress"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                }`}
              >
                Status: {project.status}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tasks?.map((task) => (
          <Card key={task._id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{task.title}</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEditClick(task)}
                  className="h-8 w-8 text-gray-500 hover:text-blue-600"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-gray-600 text-sm mb-4">{task.description}</p>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>
                  Assigned to:{" "}
                  {typeof task.assignee === "object"
                    ? task.assignee.name
                    : departmentEmployees.find(
                        (emp) => emp._id === task.assignee,
                      )?.name || task.assignee}
                </span>
                <span>
                  Due: {new Date(task.deadline).toLocaleDateString("en-GB")}
                </span>
              </div>
              <div className="mt-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    task.status === "Completed"
                      ? "bg-green-100 text-green-800"
                      : task.status === "In Progress"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {task.status}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Task Dialog */}
      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) setFormErrors({});
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Task Title</Label>
              <Input
                value={newTask.title}
                onChange={(e) =>
                  setNewTask({ ...newTask, title: e.target.value })
                }
              />
              {formErrors.title && (
                <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>
              )}
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={newTask.description}
                onChange={(e) =>
                  setNewTask({ ...newTask, description: e.target.value })
                }
              />
              {formErrors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {formErrors.description}
                </p>
              )}
            </div>
            <div>
              <Label>Assign To</Label>
              <Select
                value={newTask.assignee}
                onValueChange={(value) =>
                  setNewTask({ ...newTask, assignee: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an employee" />
                </SelectTrigger>
                <SelectContent>
                  {departmentEmployees
                    .filter((employee) => employee.role === "EMPLOYEE")
                    .map((employee) => (
                      <SelectItem key={employee._id} value={employee._id}>
                        {employee.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {formErrors.assignee && (
                <p className="text-red-500 text-sm mt-1">
                  {formErrors.assignee}
                </p>
              )}
            </div>
            <div>
              <Label>Deadline</Label>
              <Input
                type="date"
                value={newTask.deadline}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) =>
                  setNewTask({ ...newTask, deadline: e.target.value })
                }
              />
              {formErrors.deadline && (
                <p className="text-red-500 text-sm mt-1">
                  {formErrors.deadline}
                </p>
              )}
            </div>
            <Button onClick={handleCreateTask} className="w-full">
              Create Task
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) setFormErrors({});
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Task Title</Label>
              <Input
                value={editTask.title}
                onChange={(e) =>
                  setEditTask({ ...editTask, title: e.target.value })
                }
              />
              {formErrors.title && (
                <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>
              )}
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={editTask.description}
                onChange={(e) =>
                  setEditTask({ ...editTask, description: e.target.value })
                }
              />
              {formErrors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {formErrors.description}
                </p>
              )}
            </div>
            <div>
              <Label>Assign To</Label>
              <Select
                value={editTask.assignee}
                onValueChange={(value) =>
                  setEditTask({ ...editTask, assignee: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an employee" />
                </SelectTrigger>
                <SelectContent>
                  {departmentEmployees
                    .filter((employee) => employee.role === "EMPLOYEE")
                    .map((employee) => (
                      <SelectItem key={employee._id} value={employee._id}>
                        {employee.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {formErrors.assignee && (
                <p className="text-red-500 text-sm mt-1">
                  {formErrors.assignee}
                </p>
              )}
            </div>
            <div>
              <Label>Deadline</Label>
              <Input
                type="date"
                value={editTask.deadline}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) =>
                  setEditTask({ ...editTask, deadline: e.target.value })
                }
              />
              {formErrors.deadline && (
                <p className="text-red-500 text-sm mt-1">
                  {formErrors.deadline}
                </p>
              )}
            </div>
            <Button onClick={handleUpdateTask} className="w-full">
              Update Task
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectDetails;
