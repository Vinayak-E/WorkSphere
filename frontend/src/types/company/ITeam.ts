export interface Employee {
    _id: string;
    employeeId: string;
    name: string;
    email: string;
    mobile: string;
    dob: string;
    workMode: string;
    department: {
      _id: string;
      name: string;
    };
    position: string;
    gender: string;
    status: string;
    role: string;
    salary?: string;
    employmentStartDate?: string;
    profilePicture?: string | null;
    address?: {
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
    };
    qualifications?: Array<{
      degree?: string;
      institution?: string;
      yearOfCompletion?: number; 
    }>;
  }
  
  export interface Department {
    _id: string;
    name: string;
    status: string;
  }