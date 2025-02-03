import { Connection, connection } from "mongoose";
import { IProject, ITask } from "../../interfaces/company/IProject.types";
import { ProjectRepository } from "../../repositories/employee/projectRepository";
import { EmployeeRepository } from "../../repositories/employee/employeeRepository";

export class ProjectService {
    constructor(private readonly projectRepository:ProjectRepository,private readonly employeeRepository:EmployeeRepository) {}
  
    async createProject(connection :Connection,projectData:IProject): Promise<IProject> {
        if (!projectData.manager) {
          throw new Error("Manager ID is required");
        }
        
        return this.projectRepository.createProject(connection,{
          ...projectData,
          status: "Pending",
          employees: [],     
          tasks: []          
        });
      }
    
      async getManagerProjects(connection:Connection ,id: string): Promise<IProject[]> {


           
        return this.projectRepository.getProjectsByManager(connection,id);
      }



      async getProjectDetails(connection: Connection, projectId: string): Promise<IProject | null> {
        return this.projectRepository.getProjectById(connection, projectId);
      }
    
      // New method: Add a task to a project
      async addTask(connection: Connection, taskData: ITask): Promise<ITask> {
        // Optionally, you could add validations here (e.g., check that the project exists)
        return this.projectRepository.createTask(connection, taskData);
      }
    }