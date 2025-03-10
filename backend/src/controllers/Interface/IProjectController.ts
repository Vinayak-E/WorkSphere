import { Request, Response, NextFunction } from 'express';

export interface IProjectController {
    getProjects(req: Request, res: Response, next: NextFunction): Promise<void>;
    createProject(req: Request, res: Response, next: NextFunction): Promise<void>;
    getProjectById(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateProject(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateProjectStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteProject(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAllProjects(req: Request, res: Response, next: NextFunction): Promise<void>;
}
