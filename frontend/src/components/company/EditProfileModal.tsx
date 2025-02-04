import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CompanyController } from '@/controllers/company/company.controller';
import { companyProfileSchema, CompanyProfileFormData } from '@/utils/companyValidations';
import { Icompany } from '@/types/types';
import { toast } from 'react-toastify';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: Icompany;
  onUpdate: (updatedData: Icompany) => void;
  companyId: string;
}

const EditProfileModal = ({ isOpen, onClose, company, onUpdate, companyId }: EditProfileModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CompanyProfileFormData>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: {
      companyName: company.companyName,
      email: company.email,
      phone: company.phone || '',
      industry: company.industry || '',
      businessRegNo: company.businessRegNo || '',
      city: company.city || '',
      state: company.state || '',
      country: company.country || '',
      zipcode: company.zipcode || '',
    }
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        companyName: company.companyName,
        email: company.email,
        phone: company.phone || '',
        industry: company.industry || '',
        businessRegNo: company.businessRegNo || '',
        city: company.city || '',
        state: company.state || '',
        country: company.country || '',
        zipcode: company.zipcode || '',
      });
    }
  }, [isOpen, company, reset]);

  const onSubmit = async (data: CompanyProfileFormData) => {
    try {
      const updatedCompany = await CompanyController.handleProfileUpdate(data, companyId);
      onUpdate(updatedCompany);
      toast.success('Company profile updated successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to update company profile');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Company Profile</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Company Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  {...register('companyName')}
                  className="mt-1 bg-gray-200"
                  readOnly
                />
                {errors.companyName && (
                  <p className="text-sm text-red-500 mt-1">{errors.companyName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  className="mt-1"
                />
                {errors.phone && (
                  <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
                )}
              </div>
      

              <div>
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  {...register('industry')}
                  className="mt-1"
                />
                {errors.industry && (
                  <p className="text-sm text-red-500 mt-1">{errors.industry.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="businessRegNo">Business Registration Number</Label>
                <Input
                  id="businessRegNo"
                  {...register('businessRegNo')}
                  className="mt-1"
                />
                {errors.businessRegNo && (
                  <p className="text-sm text-red-500 mt-1">{errors.businessRegNo.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
    
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  className="mt-1 bg-gray-200"
                  readOnly
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                )}
              </div>
       
             

              <div className="space-y-2">
                <Label>Address</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Input
                      placeholder="City"
                      {...register('city')}
                    />
                    {errors.city && (
                      <p className="text-sm text-red-500 mt-1">{errors.city.message}</p>
                    )}
                  </div>
                  <div>
                    <Input
                      placeholder="State"
                      {...register('state')}
                    />
                    {errors.state && (
                      <p className="text-sm text-red-500 mt-1">{errors.state.message}</p>
                    )}
                  </div>
                  <div>
                    <Input
                      placeholder="Country"
                      {...register('country')}
                    />
                    {errors.country && (
                      <p className="text-sm text-red-500 mt-1">{errors.country.message}</p>
                    )}
                  </div>
                  <div>
                    <Input
                      placeholder="ZIP Code"
                      {...register('zipcode')}
                    />
                    {errors.zipcode && (
                      <p className="text-sm text-red-500 mt-1">{errors.zipcode.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileModal;