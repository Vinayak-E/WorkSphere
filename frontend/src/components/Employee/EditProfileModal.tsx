import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileController } from "../../controllers/employee/employee.controller";
import { ProfileFormData } from "../../utils/validations";

interface FormErrors {
  [key: string]: string;
}

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: any;
  onUpdate: (updatedData: any) => void;
  employeeId: string;
}
const EditProfileModal = ({
  isOpen,
  onClose,
  employee,
  onUpdate,
  employeeId,
}: EditProfileModalProps) => {
  const [formData, setFormData] = useState<ProfileFormData>({
    ...employee,
    qualifications: [...(employee?.qualifications || [])],
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [imagePreview, setImagePreview] = useState(employee?.profilePicture);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    section: string,
    index: number | null = null,
  ) => {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: "" }));

    if (section === "root") {
      setFormData((prev) => ({ ...prev, [name]: value }));
    } else if (section === "address") {
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [name]: value },
      }));
    } else if (section === "qualifications" && index !== null) {
      const newQualifications = [...formData.qualifications];
      newQualifications[index] = { ...newQualifications[index], [name]: value };
      setFormData((prev) => ({
        ...prev,
        qualifications: newQualifications,
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setFormData((prev) => ({ ...prev, profilePicture: file }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setErrors({});
      const updatedProfile = await ProfileController.handleProfileUpdate(
        formData,
        employeeId,
      );
      onUpdate(updatedProfile);
      onClose();
    } catch (error) {
      if (error instanceof Error) {
        try {
          const validationErrors = JSON.parse(error.message);
          const formattedErrors: FormErrors = {};
          validationErrors.forEach((err: { path: string; message: string }) => {
            formattedErrors[err.path] = err.message;
          });
          setErrors(formattedErrors);
        } catch {
          console.error("Error updating profile:", error);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="address">Address</TabsTrigger>
            <TabsTrigger value="qualifications">Education</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative group">
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 shadow-lg">
                  <img
                    src={imagePreview || "/api/placeholder/150/150"}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                </div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>

              <div className="w-full max-w-xl space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Full Name</Label>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange(e, "root")}
                      placeholder="Enter your full name"
                      className={`h-10 ${errors.name ? "border-red-500" : ""}`}
                    />
                    {errors.name && (
                      <span className="text-sm text-red-500">
                        {errors.name}
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Email Address</Label>
                    <Input
                      name="email"
                      readOnly
                      value={formData.email}
                      onChange={(e) => handleInputChange(e, "root")}
                      className="h-10  bg-gray-200"
                      placeholder="Enter your email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Mobile Number</Label>
                    <Input
                      name="mobile"
                      value={formData.mobile}
                      onChange={(e) => handleInputChange(e, "root")}
                      placeholder="Enter your mobile number"
                      className={`h-10 ${errors.mobile ? "border-red-500" : ""}`}
                    />
                    {errors.mobile && (
                      <span className="text-sm text-red-500">
                        {errors.mobile}
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Date of Birth</Label>
                    <Input
                      type="date"
                      name="dob"
                      value={formData.dob?.split("T")[0]}
                      onChange={(e) => handleInputChange(e, "root")}
                      className={`h-10 ${errors.dob ? "border-red-500" : ""}`}
                    />
                    {errors.dob && (
                      <span className="text-sm text-red-500">{errors.dob}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="address" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>City</Label>
                <Input
                  name="city"
                  value={formData.address?.city}
                  onChange={(e) => handleInputChange(e, "address")}
                  className={errors["address.city"] ? "border-red-500" : ""}
                />
                {errors["address.city"] && (
                  <span className="text-sm text-red-500">
                    {errors["address.city"]}
                  </span>
                )}
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Input
                  name="state"
                  value={formData.address?.state}
                  onChange={(e) => handleInputChange(e, "address")}
                  className={errors["address.state"] ? "border-red-500" : ""}
                />
                {errors["address.state"] && (
                  <span className="text-sm text-red-500">
                    {errors["address.state"]}
                  </span>
                )}
              </div>
              <div className="space-y-2">
                <Label>Zip Code</Label>
                <Input
                  name="zipCode"
                  value={formData.address?.zipCode}
                  onChange={(e) => handleInputChange(e, "address")}
                  className={errors["address.zipCode"] ? "border-red-500" : ""}
                />
                {errors["address.zipCode"] && (
                  <span className="text-sm text-red-500">
                    {errors["address.zipCode"]}
                  </span>
                )}
              </div>
              <div className="space-y-2">
                <Label>Country</Label>
                <Input
                  name="country"
                  value={formData.address?.country}
                  onChange={(e) => handleInputChange(e, "address")}
                  className={errors["address.country"] ? "border-red-500" : ""}
                />
                {errors["address.country"] && (
                  <span className="text-sm text-red-500">
                    {errors["address.country"]}
                  </span>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="qualifications" className="space-y-4">
            {formData.qualifications.map((qual, index) => (
              <div key={index} className="relative border p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Degree</Label>
                    <Input
                      name="degree"
                      value={qual.degree}
                      onChange={(e) =>
                        handleInputChange(e, "qualifications", index)
                      }
                      className={
                        errors[`qualifications.${index}.degree`]
                          ? "border-red-500"
                          : ""
                      }
                    />
                    {errors[`qualifications.${index}.degree`] && (
                      <span className="text-sm text-red-500">
                        {errors[`qualifications.${index}.degree`]}
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Institution</Label>
                    <Input
                      name="institution"
                      value={qual.institution}
                      onChange={(e) =>
                        handleInputChange(e, "qualifications", index)
                      }
                      className={
                        errors[`qualifications.${index}.institution`]
                          ? "border-red-500"
                          : ""
                      }
                    />
                    {errors[`qualifications.${index}.institution`] && (
                      <span className="text-sm text-red-500">
                        {errors[`qualifications.${index}.institution`]}
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Year of Completion</Label>
                    <Input
                      name="yearOfCompletion"
                      value={qual.yearOfCompletion}
                      onChange={(e) =>
                        handleInputChange(e, "qualifications", index)
                      }
                      className={
                        errors[`qualifications.${index}.yearOfCompletion`]
                          ? "border-red-500"
                          : ""
                      }
                    />
                    {errors[`qualifications.${index}.yearOfCompletion`] && (
                      <span className="text-sm text-red-500">
                        {errors[`qualifications.${index}.yearOfCompletion`]}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileModal;
