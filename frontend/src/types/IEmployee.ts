export interface Address {
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Qualification {
  degree: string;
  institution: string;
  yearOfCompletion: string;
}

export interface Department {
  name: string;
  _id: string;
}

export interface IEmployee {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  dob: string;
  gender: string;
  profilePicture?: string;
  status: "Active" | "Inactive";
  position: string;
  department?: Department;
  workMode: string;
  salary: number;
  employeeId: string;
  role: string;
  address: Address;
  qualifications: Qualification[];
}

export interface AuthState {
  auth: {
    user: {
      email: string;
    } | null;
  };
}
