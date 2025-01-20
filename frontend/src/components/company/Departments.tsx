import api from "@/api/axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { Plus, Loader2, Search, Edit, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "react-toastify";

const ITEMS_PER_PAGE = 10;

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "", status: "Active" });
  const [formErrors, setFormErrors] = useState({});
  const [modalError, setModalError] = useState("");

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    const filtered = departments.filter(
      (dept) =>
        dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dept.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredDepartments(filtered);
    setCurrentPage(1);
  }, [searchQuery, departments]);

  const fetchDepartments = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/company/departments", {
        withCredentials: true,
      });
      setDepartments(response.data.data);
      setFilteredDepartments(response.data.data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to fetch departments";
      toast.error(errorMessage);
      console.error("Error fetching departments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = "Department name is required";
    } else if (formData.name.trim().length < 2) {
      errors.name = "Department name must be at least 2 characters";
    } else if (formData.name.trim().length > 50) {
      errors.name = "Department name cannot exceed 50 characters";
    }

    if (formData.description && formData.description.length > 500) {
      errors.description = "Description cannot exceed 500 characters";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    setModalError("");
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      if (isEditMode) {
        const response = await api.put(
          `/company/departments/editDepartment/${selectedDepartment._id}`,
          formData,
          { withCredentials: true }
        );
        
        setDepartments(departments.map(dept => 
          dept._id === selectedDepartment._id ? { ...dept, ...formData } : dept
        ));
        toast.success("Department updated successfully!");
        handleCloseModal();
      } else {
        const response = await api.post(
          "/company/addDepartment",
          formData,
          { withCredentials: true }
        );
        const newDepartment = response.data.data;
        setDepartments([...departments, newDepartment]);
        toast.success("Department added successfully!");
        handleCloseModal();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
        (isEditMode ? "Failed to update department" : "Failed to add department");
      
      if (error.response?.data?.errors) {
        const backendErrors = error.response.data.errors;
        setFormErrors(backendErrors);
        setModalError("Please correct the errors below");
      } else {
        setModalError(errorMessage);
      }
      console.error("Error saving department:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (department) => {
    setSelectedDepartment(department);
    setFormData({
      name: department.name,
      description: department.description || "",
      status: department.status || "Active"
    });
    setFormErrors({});
    setModalError("");
    setIsEditMode(true);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIsEditMode(false);
    setSelectedDepartment(null);
    setFormData({ name: "", description: "", status: "Active" });
    setFormErrors({});
    setModalError("");
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredDepartments.length / ITEMS_PER_PAGE);
  const paginatedDepartments = filteredDepartments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">Departments</CardTitle>
            <CardDescription className="mt-2">
              Manage your company's departments and organizational structure
            </CardDescription>
          </div>
          <Button onClick={() => setShowModal(true)} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Add Department
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search departments..."
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
        ) : paginatedDepartments.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedDepartments.map((dept) => (
                  <TableRow key={dept._id}>
                    <TableCell className="font-medium">{dept.name}</TableCell>
                    <TableCell className="max-w-md truncate">
                      {dept.description || "No description"}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={dept.status === "Active" ? "success" : "secondary"}
                        className={dept.status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                      >
                        {dept.status || "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(dept.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(dept)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to{" "}
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredDepartments.length)} of{" "}
                {filteredDepartments.length} departments
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
        ) : (
          <div className="text-center py-8 text-gray-500">
            No departments found. Add your first department to get started.
          </div>
        )}
      </CardContent>

      <Dialog open={showModal} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Edit Department" : "Add New Department"}
            </DialogTitle>
          </DialogHeader>
          
          {modalError && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{modalError}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Department Name
                <span className="text-red-500 ml-1">*</span>
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (formErrors.name) {
                    setFormErrors({ ...formErrors, name: null });
                  }
                  setModalError("");
                }}
                placeholder="Enter department name"
                disabled={isSubmitting}
                className={formErrors.name ? "border-red-500 focus:ring-red-500" : ""}
              />
              {formErrors.name && (
                <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => {
                  setFormData({ ...formData, description: e.target.value });
                  if (formErrors.description) {
                    setFormErrors({ ...formErrors, description: null });
                  }
                  setModalError("");
                }}
                placeholder="Enter department description"
                disabled={isSubmitting}
                rows={3}
                className={formErrors.description ? "border-red-500 focus:ring-red-500" : ""}
              />
              {formErrors.description && (
                <p className="text-sm text-red-500 mt-1">{formErrors.description}</p>
              )}
            </div>
            
            {isEditMode && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => {
                    setFormData({ ...formData, status: value });
                    if (formErrors.status) {
                      setFormErrors({ ...formErrors, status: null });
                    }
                    setModalError("");
                  }}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className={formErrors.status ? "border-red-500" : ""}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.status && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.status}</p>
                )}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseModal}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.name.trim() || isSubmitting}
              className="bg-primary hover:bg-primary/90"
            >
              {isSubmitting && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {isEditMode ? "Save Changes" : "Add Department"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default Departments;