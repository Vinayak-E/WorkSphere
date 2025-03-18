import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Building2,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  FileText,
  Clock,
  ChevronLeft,
  Loader2,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "react-toastify";
import api from "@/api/axios";

interface Company {
  _id: string;
  companyName: string;
  email: string;
  phone: string;
  isActive: boolean;
  industry: string;
  businessRegNo: string;
  city: string;
  state: string;
  country: string;
  zipcode: string;
  subscriptionPlan: {
    _id: string;
    name: string;
    price: number;
  };
  subscriptionStatus: "Active" | "Inactive" | "Expired";
  subscriptionStartDate: string;
  subscriptionEndDate: string;
  createdAt: string;
}

interface Payment {
  _id: string;
  companyId: string;
  tenantId: string;
  planName: string;
  amount: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
}

const CompanyDetailView = () => {
  const { id } = useParams<{ id: string }>();
  const [company, setCompany] = useState<Company | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPayments, setIsLoadingPayments] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10; // Number of payments per page

  useEffect(() => {
    fetchCompanyDetails();
  }, [id]);

  useEffect(() => {
    if (company?.companyName) {
      fetchCompanyPayments(company.companyName, currentPage);
    }
  }, [company?.companyName, currentPage]);

  const fetchCompanyDetails = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/admin/companies/${id}`);
      console.log("response of company details", response.data.data);
      setCompany(response.data.data);
    } catch (error) {
      toast.error("Failed to load company details. Please try again.");
      console.error("Error fetching company details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCompanyPayments = async (tenantId: string, page: number) => {
    setIsLoadingPayments(true);
    try {
      const response = await api.get(
        `/admin/company/${tenantId}/payments?page=${page}&limit=${limit}`
      );
      console.log("payment response", response.data.data);
      const { payments, currentPage: responsePage, totalPages: responseTotalPages } =
        response.data.data;
      setPayments(payments);
      setCurrentPage(responsePage);
      setTotalPages(responseTotalPages);
    } catch (error) {
      toast.error("Failed to load payment history. Please try again.");
      console.error("Error fetching company payments:", error);
    } finally {
      setIsLoadingPayments(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => window.history.back()}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Companies
        </Button>
      </div>

      {company ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="col-span-2">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl font-bold flex items-center gap-2">
                      <Building2 className="h-6 w-6" />
                      {company.companyName}
                    </CardTitle>
                    <CardDescription className="mt-2 flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      Business Reg: {company.businessRegNo || "Not provided"}
                    </CardDescription>
                  </div>
                  <Badge
                    className={
                      company.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }
                  >
                    {company.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-sm text-gray-500 mb-2">
                      Contact Information
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span>{company.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{company.phone || "Not provided"}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-sm text-gray-500 mb-2">
                      Business Information
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-gray-500" />
                        <span>Industry: {company.industry || "Not specified"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>
                          {[
                            company.city,
                            company.state,
                            company.country,
                            company.zipcode,
                          ]
                            .filter(Boolean)
                            .join(", ") || "Address not provided"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-sm text-gray-500 mb-2">
                      Account Status
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>Joined: {formatDate(company.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Subscription Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-sm text-gray-500 mb-2">Current Plan</h3>
                    <p className="text-lg font-semibold">
                      {company.subscriptionPlan?.planName || "No plan"}
                    </p>
                    {company.subscriptionPlan?.price && (
                      <p className="text-sm text-gray-600">
                        ${company.subscriptionPlan.price.toFixed(2)} / month
                      </p>
                    )}
                  </div>

                  <div>
                    <h3 className="font-medium text-sm text-gray-500 mb-2">Status</h3>
                    <Badge
                      className={
                        company.subscriptionStatus === "Active"
                          ? "bg-green-100 text-green-800"
                          : company.subscriptionStatus === "Expired"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {company.subscriptionStatus}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="font-medium text-sm text-gray-500 mb-2">Period</h3>
                    <div className="text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>Start: {formatDate(company.subscriptionStartDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>End: {formatDate(company.subscriptionEndDate)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="transactions">
            <TabsList>
              <TabsTrigger value="transactions">Transaction History</TabsTrigger>
            </TabsList>
            <TabsContent value="transactions">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Payment History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingPayments ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : (
                    <>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead>Plan</TableHead>
                              <TableHead>Payment Method</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {payments.length > 0 ? (
                              payments.map((payment) => (
                                <TableRow key={payment._id}>
                                  <TableCell>{formatDate(payment.createdAt)}</TableCell>
                                  <TableCell>${payment.amount.toFixed(2)}</TableCell>
                                  <TableCell>{payment.planName || "N/A"}</TableCell>
                                  <TableCell className="capitalize">
                                    {payment.paymentMethod}
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      className={
                                        payment.status === "succeeded"
                                          ? "bg-green-100 text-green-800"
                                          : payment.status === "failed"
                                          ? "bg-red-100 text-red-800"
                                          : "bg-yellow-100 text-yellow-800"
                                      }
                                    >
                                      {payment.status}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">
                                  No payment records found
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                      {/* Pagination Controls */}
                      <div className="mt-4 flex items-center justify-between">
                        <Button
                          onClick={handlePreviousPage}
                          disabled={currentPage === 1}
                          variant="outline"
                        >
                          Previous
                        </Button>
                        <span className="text-sm text-gray-700">
                          Page {currentPage} of {totalPages}
                        </span>
                        <Button
                          onClick={handleNextPage}
                          disabled={currentPage === totalPages}
                          variant="outline"
                        >
                          Next
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <p className="text-lg font-medium">Company not found</p>
              <p className="text-gray-500 mt-2">
                The company you're looking for doesn't exist or you may not have
                permission to view it.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CompanyDetailView;