import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Plus, Loader2, Search, Edit, ChevronLeft, ChevronRight } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,} from "@/components/ui/alert-dialog";
import { toast } from "react-toastify";
import api from "@/api/axios";

import EmployeeForm from "./EmployeeModal";

const ITEMS_PER_PAGE = 10;

interface Employee {
    _id: string;
    name: string;
    email: string;
    mobile: string;
    dob :string
    workMode:string;
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
    profilePicture?: string;
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
  
interface Department {
  _id: string;
  name: string;
  status: string;
}

const MyTeam = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditMode, setIsEditMode] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showStatusAlert, setShowStatusAlert] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    department: "",
    position: "",
    gender: "Male",
    status: "Active",
    role: "EMPLOYEE",
    dob: "",
    workMode: "On-Site",
    salary: "",
    profilePicture: null,
    qualifications: [{
      degree: "",
      institution: "",
      yearOfCompletion: ""
    }],
    address: {

      city: "",
      state: "",
      zipCode: "",
      country: ""
    }
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
  }, []);

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/company/employees");
      console.log("employees data at user",response.data.data);
      setEmployees(response.data.data);
    } catch (error) {
      toast.error("Failed to load employees. Please try again.");
      console.error("Error fetching employees:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await api.get("/company/departments");
      const activeDepartments = response.data.data.filter(dept => dept.status === "Active");
      setDepartments(activeDepartments);
    } catch (error) {
      toast.error("Failed to load departments. Please try again.");
      console.error("Error fetching departments:", error);
    }
  };

 
  const handleChange = (value: any, fieldPath: string) => {
    setFormData(prev => {
      const fields = fieldPath.split('.');
      const newData = JSON.parse(JSON.stringify(prev)); 
      
      let current: any = newData;
      for (let i = 0; i < fields.length - 1; i++) {
        const key = fields[i];
        if (!current[key]) current[key] = {};
        current = current[key];
      }
      
      const lastField = fields[fields.length - 1];
      current[lastField] = value;
      
      return newData;
    });
  
    
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldPath];
      return newErrors;
    });
  };


  const handleStatusChange = (value: string) => {
    if (value === "Inactive" && formData.status === "Active") {
      setPendingStatus(value);
      setShowStatusAlert(true);
    } else {
      handleChange(value, "status");
    }
  };

  const handleStatusConfirm = () => {
    if (pendingStatus) {
      handleChange(pendingStatus, "status");
      setPendingStatus(null);
    }
    setShowStatusAlert(false);
  };

  const handleSubmit = async (isValid: boolean) => {  
    if (!isValid) {
      toast.error("Please fix all errors before submitting");
      return;
    }
  
    setIsLoading(true);
    try {
      if (isEditMode && selectedEmployee) {
        await api.put(`/company/employees/editEmployee/${selectedEmployee._id}`, formData);
        toast.success("Employee updated successfully!");
      } else {
        await api.post("/company/addEmployee", formData);
        toast.success("Employee added successfully!");
      }
      
      fetchEmployees();
      handleCloseModal();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
        (isEditMode ? "Failed to update employee" : "Failed to add employee");
      toast.error(`${errorMessage}. Please try again.`);
      console.error("Error with employee operation:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setFormData({
   
      name: employee.name,
      email: employee.email,
      department: employee.department._id,
      gender: employee.gender,
      mobile: employee.mobile,
      dob:  employee.dob.split('T')[0],
      position: employee.position,
      status: employee.status,
      role: employee.role,
      address: employee.address || {
        city: "",
        state: "",
        zipCode: "",
        country: ""
      },
      workMode: employee.workMode || "",
      salary: employee.salary || "",
      profilePicture: employee.profilePicture || "",
      qualifications: employee.qualifications || [{
        degree: "",
        institution: "",
        yearOfCompletion: ""
      }]
    });
    setErrors({});
    setIsEditMode(true);
    setOpen(true);
  };

  const handleCloseModal = () => {
    setOpen(false);
    setIsEditMode(false);
    setSelectedEmployee(null);
    setFormData({
      name: "",
      email: "",
      mobile: "",
      department: "",
      dob: "",
      position: "",
      gender: "Male",
      status: "Active",
      role: "EMPLOYEE",
      salary: "",
      workMode: "",
      profilePicture: "" || null,
      address: {
        city: "",
        state: "",
        zipCode: "",
        country: ""
      },
      qualifications: [
        {
          degree: "",
          institution: "",
          yearOfCompletion: ""
        }
      ]
    });
    setErrors({});
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.department.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">My Team</CardTitle>
            <CardDescription className="mt-2">
              Manage your company's Employee Details
            </CardDescription>
          </div>
          <Button 
            onClick={() => {
              setIsEditMode(false);
              setOpen(true);
            }} 
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Employee
          </Button>
        </div>
      </CardHeader>

      {/* Status Alert Dialog */}
      <AlertDialog open={showStatusAlert} onOpenChange={setShowStatusAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Employee</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deactivate this employee? This action may restrict their access to the system. 
              You can reactivate them later if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowStatusAlert(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleStatusConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CardContent>
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Loading State and Table */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead></TableHead>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedEmployees.length > 0 ? (
                  paginatedEmployees.map((emp) => (
                    <TableRow 
                      key={emp._id}
                      className={emp.status === "Inactive" ? "opacity-60" : ""}
                    >
                      <TableCell>
                        {emp.profilePicture && (
                          <img 
                            src={emp.profilePicture} 
                            alt={emp.name} 
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        )}
                      </TableCell>
                      <TableCell>{emp.employeeId}</TableCell>
                      <TableCell>{emp.name}</TableCell>
                      <TableCell>{emp.email}</TableCell>
                      <TableCell>{emp.mobile}</TableCell>
                      <TableCell>{emp.department.name}</TableCell>
                      <TableCell>{emp.position}</TableCell>
                      <TableCell>{emp.role}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={emp.status === "Active" ? "success" : "destructive"}
                          className={emp.status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                        >
                          {emp.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(emp)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8">
                      No employees found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to{" "}
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredEmployees.length)} of{" "}
                {filteredEmployees.length} employees
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="text-sm">
                  Page {currentPage} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}


        {open && (
     <EmployeeForm
     isEditMode={isEditMode}
     formData={formData}
     handleChange={handleChange}
     handleSubmit={(isValid: boolean) => handleSubmit(isValid)}
     errors={errors}
     setErrors={setErrors}
     departments={departments}
     isLoading={isLoading}
     handleCloseModal={handleCloseModal}
   />
    )}
      </CardContent>
    </Card>
  );
};

export default MyTeam;