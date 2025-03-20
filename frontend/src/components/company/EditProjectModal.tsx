import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { IProject } from '@/types/IProject';
import { IEmployee } from '@/types/IEmployee';
import { ProjectController } from '@/controllers/employee/project.controller';
import { AlertCircle } from 'lucide-react';

interface EditProjectModalProps {
  project: IProject;
  isOpen: boolean;
  onClose: () => void;
  departmentEmployees: IEmployee[];
  onProjectUpdated: (updatedProject: IProject) => void;
}

const EditProjectModal: React.FC<EditProjectModalProps> = ({
  project,
  isOpen,
  onClose,
  departmentEmployees,
  onProjectUpdated,
}) => {
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    deadline: string;
    manager: string;
    department: string;
  }>({
    name: '',
    description: '',
    deadline: '',
    manager: '',
    department: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    const managerId =
      typeof project.manager === 'object'
        ? project.manager._id.toString()
        : project.manager.toString();

    setFormData({
      name: project.name,
      description: project.description,
      deadline: project.deadline
        ? new Date(project.deadline).toISOString().split('T')[0]
        : '',
      manager: managerId,
      department:
        typeof project.department === 'object'
          ? project.department._id.toString()
          : project.department.toString(),
    });
  }, [project]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleManagerChange = (managerId: string) => {
    setFormData(prev => ({
      ...prev,
      manager: managerId,
    }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      deadline: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await ProjectController.updateProject(
        project._id,
        formData
      );
      console.log('Update response:', response);

      const updatedProject =
        response.data?.project || response.project || response;

      if (updatedProject) {
        onProjectUpdated(updatedProject);
        onClose();
      } else {
        console.error('No project data found in response');
      }
    } catch (error) {
      console.error('Project update failed', error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Project Details</DialogTitle>
          <DialogDescription>
            Update project information and manager
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block mb-2">
              Project Name
            </label>
            <Input
              id="name"
              name="name"
              value={formData.name || ''}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block mb-2">
              Description
            </label>
            <Textarea
              id="description"
              name="description"
              value={formData.description || ''}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <label htmlFor="manager" className="block mb-2">
              Project Manager
            </label>
            <Select
              value={formData.manager}
              onValueChange={handleManagerChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Project Manager">
                  {departmentEmployees.find(e => e._id === formData.manager)
                    ?.name || 'Select Manager'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {departmentEmployees
                  .filter(employee => {
                    const employeeDept =
                      typeof employee.department === 'object'
                        ? employee.department._id
                        : employee.department;
                    const projectDept =
                      typeof project.department === 'object'
                        ? project.department._id
                        : project.department;
                    return (
                      employee.role === 'MANAGER' &&
                      employeeDept === projectDept
                    );
                  })
                  .map(employee => (
                    <SelectItem key={employee._id} value={employee._id}>
                      {employee.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="deadline" className="block mb-2">
              Project Deadline
            </label>
            <input
              id="deadline"
              type="date"
              value={formData.deadline || ''}
              onChange={handleDateChange}
              className="border rounded p-2"
              min={new Date().toISOString().split('T')[0]}
            />
            {formData.deadline && new Date(formData.deadline) < new Date() && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                Deadline cannot be in the past
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProjectModal;
