import { Connection, connection } from "mongoose";
import { IProject, ITask } from "../../interfaces/company/IProject.types";
import { ProjectRepository } from "../../repositories/employee/projectRepository";
import { EmployeeRepository } from "../../repositories/employee/employeeRepository";
import { IEmployee } from "../../interfaces/company/IEmployee.types";

export class ProjectService {
    constructor(private readonly projectRepository:ProjectRepository,private readonly employeeRepository:EmployeeRepository) {}
  
    async createProject(connection: Connection, projectData: IProject): Promise<IProject> {
      if (!projectData.manager) {
        throw new Error("Manager ID is required");
      }
    
      // Retrieve the manager's details (by ID)
      const manager = await this.employeeRepository.getEmployeeById(connection, projectData.manager.toString());
      if (!manager) {
        throw new Error("Manager not found");
      }
    
      // Convert the manager's department to a string (department id)
      const departmentId = (manager.department as any)._id 
        ? (manager.department as any)._id.toString() 
        : manager.department.toString();
    
      // Merge the department into the project data
      const projectToCreate: IProject = {
        ...projectData,
        department: departmentId, // Now a string
        status: "Pending",
        employees: [],
        tasks: []
      };
    
      console.log('Project data with department:', projectToCreate);
    
      return this.projectRepository.createProject(connection, projectToCreate);
    }
    
      async getManagerProjects(connection:Connection ,id: string): Promise<IProject[]> {


           
        const projects = await this.projectRepository.getProjectsByManager(connection,id);
        console.log(projects)
        return projects
      }



      async getProjectDetails(connection: Connection, projectId: string): Promise<{project: IProject | null, departmentEmployees: IEmployee[]}> {
        const project = await this.projectRepository.getProjectById(connection, projectId);
        
        if (!project) {
            throw new Error("Project not found");
        }

        // Get the department ID from the project's manager
        const departmentId = project.department._id || project.department.toString();
        

        const departmentEmployees = await this.employeeRepository.getEmployeesByDepartment(connection, departmentId);

        return {
            project,
            departmentEmployees
        };
    }
    
      // New method: Add a task to a project
      async addTask(connection: Connection, taskData: ITask): Promise<ITask> {
        // Optionally, you could add validations here (e.g., check that the project exists)
        return this.projectRepository.createTask(connection, taskData);
      }
    }