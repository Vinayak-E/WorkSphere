export interface IDepartment extends Document {
    _id :string
    name: string;         
    description: string;
    status :string;
    createdAt: Date;      
    updatedAt: Date;     
  }

  export interface ICreateDepartment {
    name: string;
    description: string;
    status:string
  }
  

  export interface IUpdateDepartment {
    name: string;
    description?: string;
    status?: string;
  }