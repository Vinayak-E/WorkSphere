import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Upload, ChevronRight, ChevronLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { toast } from "react-toastify";
import { uploadToCloudinary } from '@/utils/cloudinary';



interface EmployeeFormProps {
    isEditMode: boolean;
    formData: any;
    errors: { [key: string]: string };
    departments: any[];
    isLoading: boolean;
    handleChange: (value: any, field: string) => void;
    handleSubmit: (isValid: boolean) => void;
    handleCloseModal: () => void;
    setErrors: (errors: { [key: string]: string }) => void;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({
    isEditMode,
    formData,
    errors,
    departments,
    isLoading,
    handleChange,
    handleSubmit,
    handleCloseModal,
    setErrors
}) => {


    const [currentStep, setCurrentStep] = useState(1);
    const [imagePreview, setImagePreview] = useState<string | null>(
        formData.profilePicture || null 
    );
    const [isUploading, setIsUploading] = useState(false);
    const totalSteps = 4;

    const validateStep = (step: number): { isValid: boolean, errors: any } => {
        const newErrors: { [key: string]: string } = {};
        const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
        const mobileRegex = /^\d{10}$/;

    
        if (step === 1) {

            if (!formData.profilePicture) {
                newErrors.profilePicture = "Profile picture is required";
            }

            if (!formData.name.trim()) {
                newErrors.name = "Name is required";
            } else if (formData.name.length < 2) {
                newErrors.name = "Name must be at least 2 characters long";
            }

            if (!isEditMode && !formData.email.trim()) {
                newErrors.email = "Email is required";
            } else if (!isEditMode && !emailRegex.test(formData.email)) {
                newErrors.email = "Please enter a valid email address";
            }

            if (!formData.mobile.trim()) {
                newErrors.mobile = "Mobile number is required";
            } else if (!mobileRegex.test(formData.mobile)) {
                newErrors.mobile = "Please enter a valid 10-digit mobile number";
            }

            if (!formData.dob) {
                newErrors.dob = "Date of birth is required";
            } else {
                const selectedDate = new Date(formData.dob);
                const today = new Date();

                if (isNaN(selectedDate.getTime())) {
                    newErrors.dob = "Invalid date format";
                }

                const age = today.getFullYear() - selectedDate.getFullYear();
                const monthDiff = today.getMonth() - selectedDate.getMonth();
                const dayDiff = today.getDate() - selectedDate.getDate();

                if (age < 18 || (age === 18 && (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)))) {
                    newErrors.dob = "Employee must be at least 18 years old";
                }
            }

            if (!formData.role) {
                newErrors.role = "Role is required";
            }
        }

      
        if (step === 2) {
            if (!formData.department) {
                newErrors.department = "Department is required";
            }

            if (!formData.position.trim()) {
                newErrors.position = "Position is required";
            }

            if (!formData.salary.toString().trim()) {
                newErrors.salary = "Salary is required";
              } else if (isNaN(Number(formData.salary))) {
                newErrors.salary = "Salary must be a valid number";
              }

            if (!formData.workMode.trim()) {
                newErrors.workMode = "Work Mode is required";
            }

            const qualification = formData.qualifications?.[0];

            if (!qualification?.degree.trim()) {
                newErrors["qualifications.0.degree"] = "Degree is required";
            }

            if (!qualification?.institution.trim()) {
                newErrors["qualifications.0.institution"] = "Institution is required";
            }

            if (!qualification?.yearOfCompletion) {
                newErrors["qualifications.0.yearOfCompletion"] = "Year of Completion is required";
            } else if (!/^\d{4}$/.test(qualification.yearOfCompletion)) {
                newErrors["qualifications.0.yearOfCompletion"] = "Enter a valid year (e.g., 2024)";
            }


        }

       
        if (step === 3) {
            if (isEditMode && !formData.status) {
                newErrors.status = "Status is required";
            }


            if (!formData.address?.city?.trim()) {
                newErrors["address.city"] = "City is required";
            }

            if (!formData.address?.state?.trim()) {
                newErrors["address.state"] = "State is required";
            }

            if (!formData.address?.country?.trim()) {
                newErrors["address.country"] = "Country is required";
            }

      
            if (formData.address?.zipCode && !/^\d{5,6}(-\d{5,6})?$/.test(formData.address.zipCode)) {
                newErrors["address.zipCode"] = "Invalid ZIP code format";
            }


        }

       
        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors
        };
    }


    const handleNext = () => {
        const validation = validateStep(currentStep);
        if (validation.isValid) {
            setCurrentStep(prev => Math.min(prev + 1, totalSteps));
           
            const stepErrors = Object.keys(validation.errors)
                .filter(key => key.startsWith(`step${currentStep}`));
            const newErrors = { ...errors };
            stepErrors.forEach(key => delete newErrors[key]);
            setErrors(newErrors);
        } else {
            setErrors({ ...errors, ...validation.errors });
            toast.error("Please fix the errors before proceeding");
        }
    };

    const handlePrev = () => setCurrentStep(prev => Math.max(prev - 1, 1));


    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const previousImage = formData.profilePicture;
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
            setIsUploading(true);
    
            try {
                const imageUrl = await uploadToCloudinary(file);
                
                handleChange(imageUrl, "profilePicture");
                setImagePreview(imageUrl);
            } catch (error) {
                let errorMessage = 'Image upload failed';
                if (error instanceof Error) {
                    errorMessage = error.message;
                }
                toast.error(errorMessage);
                setImagePreview(previousImage || null);
                if (!previousImage) handleChange('', "profilePicture");
            } finally {
                setIsUploading(false);
              
                if (imagePreview !== previewUrl) {
                    URL.revokeObjectURL(previewUrl);
                }
            }
        }
    };


    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
    
    
        if (currentStep !== totalSteps) {
            return;
        }

        let allErrors: { [key: string]: string } = {};
        let allValid = true;
    
        for (let step = 1; step <= totalSteps; step++) {
            const validation = validateStep(step);
            allValid = allValid && validation.isValid;
            allErrors = { ...allErrors, ...validation.errors };
        }
    
        if (allValid) {
            handleSubmit(true);
        } else {
            setErrors(allErrors);
            toast.error("Please fix all errors before submitting");
            handleSubmit(false);
        }
    };

    const renderStep1 = () => (
        <div className="space-y-4">
            <div className="flex justify-center mb-6">
                <div className="relative w-32 h-32">

                <div className={`w-full h-full rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 ${
    errors.profilePicture ? "border-red-500" : "border-dashed border-gray-300"
}`}>
    {isUploading ? (
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
    ) : (
        imagePreview ? (
            <img 
                src={imagePreview} 
                alt="Preview" 
                className="w-full h-full object-cover"
                onLoad={() => {
                    if (imagePreview.startsWith('blob:')) {
                        URL.revokeObjectURL(imagePreview);
                    }
                }}
            />
        ) : (
            <div className="text-center">
                <Upload className="w-8 h-8 mx-auto text-gray-400" />
                <span className="text-sm text-gray-500">Upload Photo</span>
            </div>
        )
    )}
</div>
                    <input
                        type="file"
                        onChange={handleImageChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        accept="image/*"
                    />
                </div>
            </div>
            {errors.profilePicture && (
                <p className="text-red-500 text-sm text-center mt-2">
                    {errors.profilePicture}
                </p>
            )}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Input
                        placeholder="Name"
                        name="name"
                        value={formData.name}
                        onChange={(e) => handleChange(e.target.value, "name")}
                        className={errors.name ? "border-red-500" : ""}
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>
                <div>
                    <Input
                        placeholder="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        readOnly={isEditMode}
                        onChange={(e) => handleChange(e.target.value, "email")}
                        className={`${errors.email ? "border-red-500" : ""} ${isEditMode ? "bg-gray-100" : ""}`}
                    />
                    {isEditMode && <p className="text-gray-500 text-sm mt-1">Email cannot be modified</p>}
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
            </div>



            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Input
                        placeholder="Mobile"
                        name="mobile"
                        value={formData.mobile}
                        onChange={(e) => handleChange(e.target.value, "mobile")}
                        className={errors.mobile ? "border-red-500" : ""}
                    />
                    {errors.mobile && <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>}
                </div>
                <div>
                    <Select
                        value={formData.gender}
                        onValueChange={(value) => handleChange(value, "gender")}

                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select Gender" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem key="Male" value="Male">Male</SelectItem>
                            <SelectItem key="Female" value="Female">Female</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <div className="text-sm text-gray-500 mb-2">Date of Birth</div>
                    <Input
                        type="date"
                        name="dob"
                        value={formData.dob || ""}
                        onChange={(e) => handleChange(e.target.value, "dob")}
                        max={new Date().toISOString().split("T")[0]}
                        className={errors.dob ? "border-red-500" : ""}
                    />
                    {errors.dob && <p className="text-red-500 text-sm mt-1">{errors.dob}</p>}
                </div>
                <div>
                    <div className="text-sm text-gray-500 mb-2">Select Role</div>
                    <Select
                        value={formData.role}
                        onValueChange={(value) => handleChange(value, "role")}
                    >
                        <SelectTrigger className={errors.role ? "border-red-500" : ""}>
                            <SelectValue placeholder="Select Role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem key="EMPLOYEE" value="EMPLOYEE">Employee</SelectItem>
                            <SelectItem key="MANAGER" value="MANAGER">Manager</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
                </div>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>

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
                    {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department}</p>}
                </div>

                <div>

                    <Input
                        placeholder="Position"
                        name="position"
                        value={formData.position}
                        onChange={(e) => handleChange(e.target.value, "position")}
                        className={errors.position ? "border-red-500" : ""}
                    />
                    {errors.position && <p className="text-red-500 text-sm mt-1">{errors.position}</p>}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>

                    <Input
                        type="number"
                        placeholder="Salary"
                        name="salary"
                        min={0}
                        value={formData.salary || ""}
                        onChange={(e) => handleChange(e.target.value, "salary")}
                        className={errors.salary ? "border-red-500" : ""}
                    />
                    {errors.salary && <p className="text-red-500 text-sm mt-1">{errors.salary}</p>}
                </div>
                <div>
                    <Select
                        value={formData.workMode}
                        onValueChange={(value) => handleChange(value, "workMode")}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select Work Mode" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem key="On-Site" value="On-Site">On-Site</SelectItem>
                            <SelectItem key="Remote" value="Remote">Remote</SelectItem>
                            <SelectItem key="Hybrid" value="Hybrid">Hybrid</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.workMode && <p className="text-red-500 text-sm mt-1">{errors.workMode}</p>}
                </div>
            </div>

            <Card className="p-4">
                <h3 className="font-medium mb-2">Latest Educational Qualification</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>

                        <Input
                            placeholder="Degree"
                            name="qualifications.0.degree"
                            value={formData.qualifications?.[0]?.degree || ""}
                            onChange={(e) => handleChange(e.target.value, "qualifications.0.degree")}
                            className={errors["qualifications.0.degree"] ? "border-red-500" : ""}
                        />
                        {errors["qualifications.0.degree"] && (<p className="text-red-500 text-sm mt-1"> {errors["qualifications.0.degree"]} </p>)}

                    </div>
                    <div>

                        <Input
                            placeholder="Institution"
                            name="qualifications.0.institution"
                            value={formData.qualifications?.[0]?.institution || ""}
                            onChange={(e) => handleChange(e.target.value, "qualifications.0.institution")}
                            className={errors["qualifications.0.institution"] ? "border-red-500" : ""}
                        />
                        {errors["qualifications.0.institution"] && (<p className="text-red-500 text-sm mt-1"> {errors["qualifications.0.institution"]} </p>)}
                    </div>
                    <div>

                        <Input
                            type="number"
                            placeholder="Year of Completion"
                            name="qualifications.0.yearOfCompletion"
                            value={formData.qualifications?.[0]?.yearOfCompletion || ""}
                            onChange={(e) => handleChange(e.target.value, "qualifications.0.yearOfCompletion")}
                            className={errors["qualifications.0.yearOfCompletion"] ? "border-red-500" : ""}
                        />
                        {errors["qualifications.0.yearOfCompletion"] && (<p className="text-red-500 text-sm mt-1"> {errors["qualifications.0.yearOfCompletion"]} </p>)}
                    </div>
                </div>
            </Card>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-4">
            <Card className="p-4">
                <h3 className="font-medium mb-2">Address Details</h3>
                <div className="grid grid-cols-2 gap-4">

                    <div>

                        <Input
                            placeholder="City"
                            name="address.city"
                            value={formData.address?.city || ""}
                            onChange={(e) => handleChange(e.target.value, "address.city")}
                            className={errors["address.city"] ? "border-red-500" : ""}
                        />
                        {errors["address.city"] && (<p className="text-red-500 text-sm mt-1">{errors["address.city"]}</p>)}
                    </div>
                    <div>

                        <Input
                            placeholder="State"
                            name="address.state"
                            value={formData.address?.state || ""}
                            onChange={(e) => handleChange(e.target.value, "address.state")}
                            className={errors["address.state"] ? "border-red-500" : ""}
                        />
                        {errors["address.state"] && (<p className="text-red-500 text-sm mt-1">{errors["address.state"]}</p>)}
                    </div>


                    <div>

                        <Select
                            value={formData.address?.country || ""}
                            onValueChange={(value) => handleChange(value, "address.country")}
                        >
                            <SelectTrigger className={errors["address.country"] ? "border-red-500" : ""}>
                                <SelectValue placeholder="Select your Country" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem key="India" value="India">India</SelectItem>
                                <SelectItem key="United States" value="United States">United States</SelectItem>
                                <SelectItem key="Canada" value="Canada">Canada</SelectItem>
                                <SelectItem key="Germany" value="Germany">Germany</SelectItem>
                                <SelectItem key="France" value="France">France</SelectItem>
                                <SelectItem key="United Kingdom" value="United Kingdom">United Kingdom</SelectItem>
                                <SelectItem key="Spain" value="Spain">Spain</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors["address.country"] && (<p className="text-red-500 text-sm mt-1">{errors["address.country"]}</p>)}
                    </div>
                    <div>

                        <Input
                            placeholder="ZIP Code"
                            name="address.zipCode"
                            value={formData.address?.zipCode || ""}
                            onChange={(e) => handleChange(e.target.value, "address.zipCode")}
                            className={errors["address.zipCode"] ? "border-red-500" : ""}
                        />
                        {errors["address.zipCode"] && (<p className="text-red-500 text-sm mt-1">{errors["address.zipCode"]}</p>)}
                    </div>


                </div>
            </Card>

            {isEditMode && (
                <Select
                    value={formData.status}
                    onValueChange={(value) => handleChange(value, "status")}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                </Select>
            )}
        </div>
    );

    return (
        <Dialog open={true} onOpenChange={handleCloseModal}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>
                        {isEditMode ? "Edit Employee" : "Add New Employee"}
                    </DialogTitle>
                </DialogHeader>

                <div className="relative">
                    {/* Progress indicator */}
                    <div className="absolute top-0 w-full">
                        <div className="flex justify-center mb-4">
                            <div className="flex items-center space-x-2">
                                {[1, 2, 3].map((step) => (
                                    <React.Fragment key={step}>
                                        <div
                                            className={`w-3 h-3 rounded-full ${step <= currentStep ? 'bg-primary' : 'bg-gray-200'
                                                }`}
                                        />
                                        {step < 3 && (
                                            <div className="w-8 h-0.5 bg-gray-200" />
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    </div>

                            <form 
                        onSubmit={handleFormSubmit} 
                        className="mt-8"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                            if (currentStep !== totalSteps) {
                                e.preventDefault();
                                handleNext();
                            }
                            }
                        }}
                        >
                        {currentStep === 1 && renderStep1()}
                        {currentStep === 2 && renderStep2()}
                        {currentStep === 3 && renderStep3()}

                        <div className="flex justify-between mt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={currentStep === 1 ? handleCloseModal : handlePrev}
                            >
                                {currentStep === 1 ? 'Cancel' : (
                                    <>
                                        <ChevronLeft className="w-4 h-4 mr-2" />
                                        Back
                                    </>
                                )}
                            </Button>

                            {currentStep < totalSteps ? (
                                <Button type="button" onClick={handleNext}>
                                    Next
                                    <ChevronRight className="w-4 h-4 ml-2" />
                                </Button>
                            ) : (
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
                            )}
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default EmployeeForm;