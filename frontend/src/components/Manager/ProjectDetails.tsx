import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ScaleLoader } from 'react-spinners';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectService } from "@/services/employee/project.service";
import { IProject, ITask } from "@/types/IProject";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Clock, Briefcase, ListChecks, PlusCircle } from "lucide-react";

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<IProject | null>(null);
  const [departmentEmployees, setDepartmentEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assignee: "",
    deadline: ""
  });

  useEffect(() => {
    const loadProject = async () => {
      try {
        const response = await ProjectService.getProjectById(id!);
        setProject(response.data.project);
        setDepartmentEmployees(response.data.departmentEmployees);
      } catch (error) {
        console.error('Error loading project:', error);
        navigate('/employee/projects');
      } finally {
        setIsLoading(false);
      }
    };
    loadProject();
  }, [id]);

  const handleCreateTask = async () => {
    try {
        const createdTask = await ProjectService.createProjectTask(id!, newTask) as ITask;

      setProject(prev => prev ? ({
        ...prev,
        tasks: [...(prev.tasks || []), createdTask]
      }) : null);
      setIsDialogOpen(false);
      setNewTask({
        title: "",
        description: "",
        assignee: "",
        deadline: ""
      });
    } catch (error) {
      console.error('Error creating task:', error);
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
            <Button onClick={() => setIsDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Assign Task
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-600" />
              <span className="font-medium">Deadline: {new Date(project.deadline).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-gray-600" />
              <span className="font-medium">Team Members: {project.employees?.length || 0}</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <ListChecks className="w-5 h-5 text-gray-600" />
              <span className="font-medium">Total Tasks: {project.tasks?.length || 0}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm ${project.status === 'Completed' 
                ? 'bg-green-100 text-green-800' 
                : project.status === 'In Progress' 
                ? 'bg-yellow-100 text-yellow-800' 
                : 'bg-gray-100 text-gray-800'}`}>
                Status: {project.status}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {project.tasks?.map(task => (
          <Card key={task._id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-2">{task.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{task.description}</p>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>Assigned to: {task.assignee}</span>
                <span>Due: {new Date(task.deadline).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Assign Task Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Task Title</Label>
              <Input 
                value={newTask.title}
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input 
                value={newTask.description}
                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
              />
            </div>
            <div>
              <Label>Assign To</Label>
              <Select
                value={newTask.assignee}
                onValueChange={(value) => setNewTask({...newTask, assignee: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an employee" />
                </SelectTrigger>
                <SelectContent>
                  {departmentEmployees.map((employee) => (
                    <SelectItem key={employee._id} value={employee._id}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Deadline</Label>
              <Input
                type="date"
                value={newTask.deadline}
                onChange={(e) => setNewTask({...newTask, deadline: e.target.value})}
              />
            </div>
            <Button onClick={handleCreateTask} className="w-full">
              Create Task
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectDetails;