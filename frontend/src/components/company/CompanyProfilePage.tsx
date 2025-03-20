import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Building2,
  Mail,
  Phone,
  BookUser,
  MapPin,
  BadgeDollarSign,
  Pencil,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import EditProfileModal from './EditProfileModal';
import { CompanyController } from '@/controllers/company/company.controller';
import { Icompany } from '@/types/types';
import { RootState } from '@/redux/store';

const CompanyProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<Icompany | null>(null);
  const [error, setError] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);

  const handleProfileUpdate = (updatedData: Icompany) => {
    setCompany(updatedData);
  };

  useEffect(() => {
    if (user?.userData) {
      setCompany(user.userData as Icompany);
      setLoading(false);
      return;
    }

    const fetchCompanyData = async () => {
      try {
        const profileData = await CompanyController.getCompanyProfile();
        setCompany(profileData);
        setLoading(false);
      } catch (err) {
        setError('Failed to load company data');
        setLoading(false);
      }
    };

    if (user?.email) {
      fetchCompanyData();
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
            {[1, 2, 3].map(i => (
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

  if (!company) {
    return null;
  }

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
            <Pencil className="w-4 h-4" />
          </Button>

          <div className="flex items-center space-x-6">
            <div className="w-36 h-36 rounded-full bg-blue-100 flex items-center justify-center">
              <Building2 className="w-16 h-16 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {company.companyName}
              </h1>
              <div className="flex items-center space-x-4 mt-2 text-gray-600">
                <span className="flex items-center">
                  <BookUser className="w-4 h-4 mr-2" />
                  {company.industry}
                </span>
                <span className="flex items-center">
                  <BadgeDollarSign className="w-4 h-4 mr-2" />
                  {company.businessRegNo}
                </span>
              </div>
            </div>
          </div>
        </div>

        {isEditModalOpen && (
          <EditProfileModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            company={company}
            onUpdate={handleProfileUpdate}
            companyId={company._id}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-gray-500 mr-3" />
                <span>{company.email}</span>
              </div>
              <div className="flex items-center">
                <Phone className="w-5 h-5 text-gray-500 mr-3" />
                <span>{company.phone || 'Not provided'}</span>
              </div>
              <div className="flex items-center">
                <BookUser className="w-5 h-5 text-gray-500 mr-3" />
                <span>Industry: {company.industry || 'Not specified'}</span>
              </div>
              <div className="flex items-center">
                <BadgeDollarSign className="w-5 h-5 text-gray-500 mr-3" />
                <span>
                  Registration: {company.businessRegNo || 'Not provided'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-gray-500 mr-3 mt-1" />
                <div className="space-y-1">
                  {company.city && <p>{company.city}</p>}
                  {company.state && <p>{company.state}</p>}
                  {company.country && <p>{company.country}</p>}
                  {company.zipcode && <p>ZIP: {company.zipcode}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfilePage;
