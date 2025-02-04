import { Connection, Model, connection } from "mongoose";
import { IProject, ITask } from "../../interfaces/company/IProject.types";
import Project from "../../models/projectModel";
import { IEmployee } from "../../interfaces/company/IEmployee.types";
import Employee from "../../models/employeeModel";
import Task from "../../models/taskModel";
import { IDepartment } from "../../interfaces/company/IDepartment.types";
import Department from "../../models/departmentModel";

export class ProjectRepository {
    private getProjectModel(connection: Connection): Model<IProject> {
        return connection.models.Project || connection.model<IProject>("Project", Project.schema);
    }
    private getEmployeeModel(connection: Connection): Model<IEmployee> {
        return connection.models.Employee || connection.model<IEmployee>("Employee", Employee.schema);
    }
    private getTaskModel(connection: Connection): Model<ITask> {
        return connection.models.Task || connection.model<ITask>("Task", Task.schema);
    }
    private getDepartmentModel(connection: Connection): Model<IDepartment> {
        return connection.models.Department || connection.model<IDepartment>("Department", Department.schema);
    }


    async createProject(connection:Connection,projectData: Partial<IProject>): Promise<IProject> {
        const projectModel = this.getProjectModel(connection)
        const project = new  projectModel(projectData);
        return project.save();
      }
    
      async getProjectsByManager(connection:Connection, managerId: string): Promise<IProject[]> {
        const projectModel = this.getProjectModel(connection)
        const employeeModel = this.getEmployeeModel(connection)
        const DepartmentModel =this.getDepartmentModel(connection)
        return projectModel
          .find({ manager: managerId })
          .populate('department')
          .populate('manager')
          .exec();
      }


      async getProjectById(connection: Connection, projectId: string): Promise<IProject | null> {
        const projectModel = this.getProjectModel(connection);
        const employeeModel = this.getEmployeeModel(connection)
        const taskModel = this.getTaskModel(connection)
        const DepartmentModel =this.getDepartmentModel(connection)
        return projectModel
          .findById(projectId)
          .populate('department')
          .populate('manager')
          .populate('employees')
          .populate('tasks') 
          .exec();
      }

      async createTask(connection: Connection, taskData: Partial<ITask>): Promise<ITask> {
        const taskModel = this.getTaskModel(connection);
        const projectModel = this.getProjectModel(connection);
        
        const task = new taskModel(taskData);
        const savedTask = await task.save();
        await projectModel.findByIdAndUpdate(
          savedTask.project,
          {
            $push: { tasks: savedTask._id },
            $addToSet: { employees: savedTask.assignee }
          },
          { new: true }
        );
      
        return savedTask;
      }
      
}