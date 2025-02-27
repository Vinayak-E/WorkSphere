import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Building2,
  Calendar,
  DollarSign,
  MapPin,
  GraduationCap,
  UserCheck,
  Pencil,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import EditProfileModal from "@/components/Employee/EditProfileModal";
import { ProfileController } from "@/controllers/employee/employee.controller";
import { IEmployee } from "@/types/IEmployee";
import { RootState } from "@/redux/store";

const EmployeeProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState<IEmployee | null>(null);
  const [error, setError] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);
  const handleProfileUpdate = (updatedData: IEmployee) => {
    setEmployee(updatedData);
  };

  useEffect(() => {
    if (user?.userData) {
      setEmployee(user.userData as IEmployee);
      setLoading(false);
      return;
    }

    const fetchEmployeeData = async () => {
      try {
        const profileData = await ProfileController.getProfile();
        setEmployee(profileData);
        setLoading(false);
      } catch (err) {
        setError("Failed to load employee data");
        setLoading(false);
      }
    };

    if (user?.email) {
      fetchEmployeeData();
    }
  }, [user?.userData, user?.email]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="bg-white rounded-lg shadow-md p-6 flex items-center space-x-6">
            <Skeleton className="w-32 h-32 rounded-full" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-72" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-2">
              Error Loading Profile
            </h2>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!employee) {
    return null;
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="bg-white rounded-lg shadow-md p-6 relative">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsEditModalOpen(true)}
            className="absolute top-4 right-4 bg-transparent border-none"
          >
            <Pencil className="w-4 h-4 " />
          </Button>

          <div className="flex items-center space-x-6">
            <div className="relative">
              <img
                src={employee.profilePicture || "/api/placeholder/150/150"}
                alt={employee.name}
                className="w-36 h-36 rounded-full object-cover border-4 border-blue-100"
              />
              <span
                className={`absolute bottom-2 right-2 w-4 h-4 rounded-full ${
                  employee.status === "Active" ? "bg-green-500" : "bg-gray-500"
                }`}
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {employee.name}
              </h1>
              <div className="flex items-center space-x-4 mt-2 text-gray-600">
                <span className="flex items-center">
                  <Briefcase className="w-4 h-4 mr-2" />
                  {employee.position}
                </span>
                <span className="flex items-center">
                  <Building2 className="w-4 h-4 mr-2" />
                  {employee.department?.name || "Department"}
                </span>
              </div>
              <div className="mt-2 inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {employee.workMode}
              </div>
            </div>
          </div>
        </div>

        {isEditModalOpen && (
          <EditProfileModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            employee={employee}
            onUpdate={handleProfileUpdate}
            employeeId={employee._id}
          />
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-gray-500 mr-3" />
                <span>{employee.email}</span>
              </div>
              <div className="flex items-center">
                <Phone className="w-5 h-5 text-gray-500 mr-3" />
                <span>{employee.mobile}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-gray-500 mr-3" />
                <span>DOB: {formatDate(employee.dob)}</span>
              </div>
              <div className="flex items-center">
                <UserCheck className="w-5 h-5 text-gray-500 mr-3" />
                <span>Gender: {employee.gender}</span>
              </div>
            </CardContent>
          </Card>

          {/* Employment Details */}
          <Card>
            <CardHeader>
              <CardTitle>Employment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center">
                <DollarSign className="w-5 h-5 text-gray-500 mr-3" />
                <span>Salary: ${employee.salary.toLocaleString()}/Month</span>
              </div>
              <div className="flex items-center">
                <User className="w-5 h-5 text-gray-500 mr-3" />
                <span>Employee ID: {employee.employeeId}</span>
              </div>
              <div className="flex items-center">
                <UserCheck className="w-5 h-5 text-gray-500 mr-3" />
                <span>Role: {employee.role}</span>
              </div>
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardHeader>
              <CardTitle>Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-gray-500 mr-3 mt-1" />
                <div>
                  <p>{employee.address.city}</p>
                  <p>
                    {employee.address.state}, {employee.address.zipCode}
                  </p>
                  <p>{employee.address.country}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Qualifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {employee.qualifications.map((qual, index) => (
                  <div key={index} className="flex items-start">
                    <GraduationCap className="w-5 h-5 text-gray-500 mr-3 mt-1" />
                    <div>
                      <p className="font-medium">{qual.degree}</p>
                      <p className="text-sm text-gray-600">
                        {qual.institution}
                      </p>
                      <p className="text-sm text-gray-500">
                        Completed: {qual.yearOfCompletion}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfilePage;
