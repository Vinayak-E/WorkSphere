import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Building2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "react-toastify";
import api from "@/api/axios";

const ITEMS_PER_PAGE = 10;

type ApprovalStatus = "Pending" | "Approved" | "Rejected";

interface Company {
  _id: string;
  companyName: string;
  email: string;
  isActive: boolean;
  isApproved: ApprovalStatus;
  businessRegNo:string;
  industry:string;
  city:string;
  state:string;
  country:string;
  zipcode:string;
  phone: string;
  createdAt: string;
  role: string;
}

interface ActionDialogState {
  isOpen: boolean;
  type: "approve" | "reject" | null;
  companyId: string | null;
}

const CompanyRequests = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [actionDialog, setActionDialog] = useState<ActionDialogState>({
    isOpen: false,
    type: null,
    companyId: null,
  });
  const [actionReason, setActionReason] = useState("");

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/admin/companyRequests");

      setCompanies(response.data);
    } catch (error) {
      toast.error("Failed to load company requests. Please try again.");
      console.error("Error fetching companies:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async () => {
    if (!actionDialog.companyId || !actionDialog.type || !actionReason.trim()) {
      toast.error("Please provide a reason for this action");
      return;
    }

    try {
      const newStatus: ApprovalStatus =
        actionDialog.type === "approve" ? "Approved" : "Rejected";
      await api.put(`/admin/companiesList/${actionDialog.companyId}/approve`, {
        isApproved: newStatus,
        reason: actionReason,
      });

      toast.success(`Company request ${newStatus.toLowerCase()} successfully`);

      fetchCompanies();
      closeActionDialog();
    } catch (error) {
      toast.error("Failed to process company request");
      console.error("Error processing company request:", error);
    }
  };

  const openActionDialog = (companyId: string, type: "approve" | "reject") => {
    setActionDialog({
      isOpen: true,
      type,
      companyId,
    });
    setActionReason("");
  };

  const closeActionDialog = () => {
    setActionDialog({
      isOpen: false,
      type: null,
      companyId: null,
    });
    setActionReason("");
  };

  const filteredCompanies = companies.filter(
    (company) =>
      company.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredCompanies.length / ITEMS_PER_PAGE);
  const paginatedCompanies = filteredCompanies.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card className="w-full max-w-7xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Building2 className="h-6 w-6" />
              Pending Company Requests
            </CardTitle>
            <CardDescription className="mt-2">
              Review and manage pending company registration requests
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search companies by name or email..."
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
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Businees Reg No</TableHead>
                    <TableHead>Request Date</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead>ZipCode</TableHead>

                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCompanies.length > 0 ? (
                    paginatedCompanies.map((company) => (
                      <TableRow key={company._id}>
                        <TableCell className="font-medium">
                          {company.companyName}
                        </TableCell>
                        <TableCell>{company.email}</TableCell>
                        <TableCell>{company.phone}</TableCell>
                        <TableCell>{company.industry}</TableCell>
                        <TableCell>{company.businessRegNo}</TableCell>
                        <TableCell>{company.city}</TableCell>
                        <TableCell>{company.state}</TableCell>
                        <TableCell>{company.zipcode}</TableCell>
                        <TableCell>{formatDate(company.createdAt)}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-green-50 text-green-600 hover:bg-green-100"
                            onClick={() =>
                              openActionDialog(company._id, "approve")
                            }
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-red-50 text-red-600 hover:bg-red-100"
                            onClick={() =>
                              openActionDialog(company._id, "reject")
                            }
                          >
                            Reject
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        No pending company requests found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                {Math.min(
                  currentPage * ITEMS_PER_PAGE,
                  filteredCompanies.length,
                )}{" "}
                of {filteredCompanies.length} requests
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
      </CardContent>

      <Dialog
        open={actionDialog.isOpen}
        onOpenChange={(open) => !open && closeActionDialog()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog.type === "approve" ? "Approve" : "Reject"} Company
              Request
            </DialogTitle>
            <DialogDescription>
              Please provide a reason for{" "}
              {actionDialog.type === "approve" ? "approving" : "rejecting"} this
              company request.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={actionReason}
            onChange={(e) => setActionReason(e.target.value)}
            placeholder="Enter your reason here..."
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={closeActionDialog}>
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              className={
                actionDialog.type === "approve" ? "bg-green-600" : "bg-red-600"
              }
            >
              {actionDialog.type === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default CompanyRequests;
