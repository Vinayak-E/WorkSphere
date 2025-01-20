import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Plus, Loader2, Search, Edit, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,} from "@/components/ui/alert-dialog";
import { toast } from "react-toastify";
import api from "@/api/axios";

const ITEMS_PER_PAGE = 10;

interface Employee {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  department: {
    _id: string;
    name: string;
  };
  position: string;
  gender: string;
  status: string;
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
    status: "Active"
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

  const validateForm = () => {
    let tempErrors: { [key: string]: string } = {};
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    const mobileRegex = /^\d{10}$/;

    if (!formData.name.trim()) {
      tempErrors.name = "Name is required";
    } else if (formData.name.length < 2) {
      tempErrors.name = "Name must be at least 2 characters long";
    }

    if (!isEditMode) {
      if (!formData.email.trim()) {
        tempErrors.email = "Email is required";
      } else if (!emailRegex.test(formData.email)) {
        tempErrors.email = "Please enter a valid email address";
      }
    }

    if (!formData.mobile.trim()) {
      tempErrors.mobile = "Mobile number is required";
    } else if (!mobileRegex.test(formData.mobile)) {
      tempErrors.mobile = "Please enter a valid 10-digit mobile number";
    }

    if (!formData.department) {
      tempErrors.department = "Department is required";
    }

    if (!formData.position.trim()) {
      tempErrors.position = "Position is required";
    }

    if (isEditMode && !formData.status) {
      tempErrors.status = "Status is required";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | string, field?: string) => {
    if (typeof e === 'string' && field) {
      setFormData(prev => ({ ...prev, [field]: e }));
      setErrors(prev => ({ ...prev, [field]: "" }));
    } else if ('target' in e) {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fill all required fields correctly");
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

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setFormData({
      name: employee.name,
      email: employee.email,
      department: employee.department._id,
      gender: employee.gender,
      mobile: employee.mobile,
      position: employee.position,
      status: employee.status
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
      position: "",
      gender: "Male",
      status: "Active"
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

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedEmployees.length > 0 ? (
                  paginatedEmployees.map((emp, index) => (
                    <TableRow 
                      key={emp._id}
                      className={emp.status === "Inactive" ? "opacity-60" : ""}
                    >
                      <TableCell>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</TableCell>
                      <TableCell>{emp.name}</TableCell>
                      <TableCell>{emp.email}</TableCell>
                      <TableCell>{emp.mobile}</TableCell>
                      <TableCell>{emp.department.name}</TableCell>
                      <TableCell>{emp.position}</TableCell>
                      <TableCell>{emp.gender}</TableCell>
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
                    <TableCell colSpan={9} className="text-center py-8">
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

        <Dialog open={open} onOpenChange={handleCloseModal}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {isEditMode ? "Edit Employee" : "Add New Employee"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  placeholder="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <Input
                  placeholder="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  readOnly={isEditMode}
                  onChange={handleChange}
                  className={`${errors.email ? "border-red-500" : ""} ${isEditMode ? "bg-gray-100" : ""}`}
                />
                {isEditMode && (
                  <p className="text-gray-500 text-sm mt-1">Email cannot be modified</p>
                )}
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <Input
                  placeholder="Mobile"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  className={errors.mobile ? "border-red-500" : ""}
                />
                {errors.mobile && (
                  <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>
                )}
              </div>

              <Select
                value={formData.department}
                onValueChange={(value) => handleChange(value, "department")}
              >
                <SelectTrigger className={errors.department ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept._id} value={dept._id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.department && (
                <p className="text-red-500 text-sm mt-1">{errors.department}</p>
              )}


              <div>
                <Input
                  placeholder="Position"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  className={errors.position ? "border-red-500" : ""}
                />
                {errors.position && (
                  <p className="text-red-500 text-sm mt-1">{errors.position}</p>
                )}
              </div>

              <Select
                value={formData.gender}
                onValueChange={(value) => handleChange(value, "gender")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>


              {isEditMode && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                    value={formData.status}
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && (
                    <p className="text-sm text-red-500 mt-1">{errors.status}</p>
                  )}
              </div>
            )}

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline"  onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {isEditMode ? "Updating..." : "Saving..."}
                    </>
                  ) : (
                    isEditMode ? "Update Employee" : "Save Employee"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default MyTeam;