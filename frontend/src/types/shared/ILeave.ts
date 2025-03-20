interface Employee {
    employeeId: string;
    name: string;
    email: string;
  }
  
 export interface Leave {
    _id: string;
    employeeId: Employee;
    startDate: string | Date;
    endDate: string | Date;
    leaveType: string;
    reason: string;
    status: string;
    appliedAt: string | Date;
  }

  export interface AttendanceRecord {
    _id: string;
    employeeId: Employee;
    checkInTime: string | Date;
    checkOutTime: string | Date;
    totalWorkedTime: number;
    status: string;
  }