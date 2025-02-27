import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Calendar,
  PlusCircle,
  Users,
  Video,
  Pencil,
  Search,
  X,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { RootState } from "@/redux/store";
import { meetService } from "@/services/employee/meet.service";
import { toast } from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Meeting, Member } from "@/types/IMeeting";
import { useNavigate } from "react-router-dom";
import DeleteConfirmationDialog from "../DeleteConfirmation";
import { ProfileService } from "@/services/employee/employee.service";
import { chatService } from "@/services/employee/chat.service";
interface FormErrors {
  meetTitle?: string;
  meetDate?: string;
  meetTime?: string;
  members?: string;
}

const MeetingManagement: React.FC = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [employees, setEmployees] = useState<Member[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [meetingForm, setMeetingForm] = useState({
    meetTitle: "",
    meetDate: "",
    meetTime: "",
    members: [] as string[],
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dateFilter, setDateFilter] = useState("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(
    null,
  );

  const openDialog = (meetingId: string) => {
    setSelectedMeetingId(meetingId);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedMeetingId(null);
  };
  const pageSize = 10;

  const currentUser = useSelector((state: RootState) => state.auth.user);
  const isManager = currentUser?.role === "MANAGER";
  const isCompany = currentUser?.role === "COMPANY";
  const navigate = useNavigate();

  useEffect(() => {
    fetchMeetings();
    if (isManager || isCompany) {
      fetchEmployees();
    }
  }, [isManager, isCompany, page, dateFilter, customStartDate, customEndDate]);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        pageSize,
        dateFilter,
        startDate: customStartDate,
        endDate: customEndDate,
      };
      const res = await meetService.getMeetings(params);
      setMeetings(res.data);
      setTotalPages(Math.ceil(res.total / pageSize));
    } catch (error) {
      toast.error("Failed to load meetings");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      if (isManager) {
        const res = await ProfileService.getDepartmentEmployees();
        setEmployees(res.data || []);
      } else if (isCompany) {
        const res = await chatService.getAllEmployees();
        setEmployees(res.data || []);
      }
    } catch (error) {
      toast.error("Failed to fetch employees");
    }
  };
  console.log(employees, "ddddddddddd");
  const validateForm = () => {
    const errors: FormErrors = {};
    const now = new Date();
    const selectedDate = new Date(meetingForm.meetDate);

    if (!meetingForm.meetTitle.trim()) {
      errors.meetTitle = "Meeting title is required";
    }

    if (!meetingForm.meetDate) {
      errors.meetDate = "Meeting date is required";
    } else if (selectedDate < new Date(now.setHours(0, 0, 0, 0))) {
      errors.meetDate = "Cannot select a past date";
    }

    if (!meetingForm.meetTime) {
      errors.meetTime = "Meeting time is required";
    } else if (selectedDate.toDateString() === now.toDateString()) {
      const [hours, minutes] = meetingForm.meetTime.split(":").map(Number);
      const selectedTime = new Date();
      selectedTime.setHours(hours, minutes, 0, 0);
      if (selectedTime < now) {
        errors.meetTime = "Cannot select a past time";
      }
    }

    if (meetingForm.members.length === 0) {
      errors.members = "At least one member must be selected";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  };

  const isMeetingExpired = (meetDate: string, meetTime: string) => {
    const meetingDate = new Date(meetDate);
    if (isNaN(meetingDate.getTime())) {
      console.error("Invalid meeting date:", meetDate);
      return false;
    }

    const [hours, minutes] = meetTime.split(":").map(Number);
    meetingDate.setHours(hours, minutes, 0, 0);

    meetingDate.setMinutes(meetingDate.getMinutes() + 30);

    const now = new Date();
    return meetingDate < now;
  };

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      await meetService.createMeeting(meetingForm);
      toast.success("Meeting created successfully");
      fetchMeetings();
      setIsOpen(false);
      resetForm();
    } catch (error) {
      toast.error("Failed to create meeting");
    } finally {
      setLoading(false);
    }
  };

  const handleEditMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !editingMeeting) return;

    try {
      setLoading(true);
      await meetService.updateMeeting(editingMeeting._id, meetingForm);
      toast.success("Meeting updated successfully");
      fetchMeetings();
      setIsOpen(false);
      setEditingMeeting(null);
      resetForm();
    } catch (error) {
      toast.error("Failed to update meeting");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedMeetingId) return;
    try {
      setLoading(true);
      await meetService.deleteMeeting(selectedMeetingId);
      toast.success("Meeting deleted successfully");
      fetchMeetings();
    } catch (error) {
      toast.error("Failed to delete meeting");
    } finally {
      setLoading(false);
      closeDialog();
    }
  };

  const resetForm = () => {
    setMeetingForm({
      meetTitle: "",
      meetDate: "",
      meetTime: "",
      members: [],
    });
    setFormErrors({});
  };

  const openEditModal = (meeting: Meeting) => {
    setEditingMeeting(meeting);
    const formattedDate = new Date(meeting.meetDate)
      .toISOString()
      .split("T")[0];
    setMeetingForm({
      meetTitle: meeting.meetTitle,
      meetDate: formattedDate,
      meetTime: meeting.meetTime,
      members: meeting.members.map((m) => m._id),
    });
    setFormErrors({});
    setIsOpen(true);
  };
  const handleDialogChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Reset everything when dialog closes
      resetForm();
      setEditingMeeting(null);
    }
  };

  const handleDateFilterChange = (value: string) => {
    setDateFilter(value);
    setPage(1);
    if (value !== "custom") {
      setCustomStartDate("");
      setCustomEndDate("");
    }
  };

  const filteredMeetings = meetings.filter((meeting) =>
    meeting.meetTitle.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <Card className="w-full max-w-6xl mx-auto border-gray-200 shadow-xl rounded-xl mt-6">
      <CardHeader className="bg-gradient-to-r from-blue-100 to-blue-200 px-6 py-4 border-b-gray-50 rounded-t-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-600" />
              Meetings
            </CardTitle>
            <p className="text-sm text-gray-500">
              Schedule and manage your meetings efficiently
            </p>
          </div>
          {(isManager || isCompany) && (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button
                  className="shadow-md hover:shadow-lg transition-shadow"
                  onClick={() => {
                    resetForm();
                    setEditingMeeting(null);
                  }}
                >
                  <PlusCircle size={18} className="mr-2" /> New Meeting
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-lg">
                    {editingMeeting ? "Edit Meeting" : "Create New Meeting"}
                  </DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={
                    editingMeeting ? handleEditMeeting : handleCreateMeeting
                  }
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Meeting Title
                    </label>
                    <Input
                      value={meetingForm.meetTitle}
                      onChange={(e) => {
                        setMeetingForm({
                          ...meetingForm,
                          meetTitle: e.target.value,
                        });
                        setFormErrors({
                          ...formErrors,
                          meetTitle: undefined,
                        });
                      }}
                      className={`focus:ring-2 ${formErrors.meetTitle ? "border-red-500" : "focus:ring-blue-500"}`}
                    />
                    {formErrors.meetTitle && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.meetTitle}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Date
                    </label>
                    <Input
                      type="date"
                      value={meetingForm.meetDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => {
                        setMeetingForm({
                          ...meetingForm,
                          meetDate: e.target.value,
                        });
                        setFormErrors({ ...formErrors, meetDate: undefined });
                      }}
                      className={`focus:ring-2 ${formErrors.meetDate ? "border-red-500" : "focus:ring-blue-500"}`}
                    />
                    {formErrors.meetDate && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.meetDate}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Time
                    </label>
                    <Input
                      type="time"
                      value={meetingForm.meetTime}
                      onChange={(e) => {
                        setMeetingForm({
                          ...meetingForm,
                          meetTime: e.target.value,
                        });
                        setFormErrors({ ...formErrors, meetTime: undefined });
                      }}
                      className={`focus:ring-2 ${formErrors.meetTime ? "border-red-500" : "focus:ring-blue-500"}`}
                    />
                    {formErrors.meetTime && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.meetTime}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Select Members
                    </label>
                    <div
                      className={`h-40 overflow-y-auto border rounded-lg p-2 ${
                        formErrors.members ? "border-red-500" : ""
                      }`}
                    >
                      {employees.map((emp) => (
                        <div
                          key={emp._id}
                          className="flex items-center py-1.5 px-2 hover:bg-gray-50 rounded"
                        >
                          <input
                            type="checkbox"
                            id={`emp-${emp._id}`}
                            checked={meetingForm.members.includes(emp._id)}
                            onChange={() => {
                              const updatedMembers =
                                meetingForm.members.includes(emp._id)
                                  ? meetingForm.members.filter(
                                      (id) => id !== emp._id,
                                    )
                                  : [...meetingForm.members, emp._id];
                              setMeetingForm({
                                ...meetingForm,
                                members: updatedMembers,
                              });
                              setFormErrors({
                                ...formErrors,
                                members: undefined,
                              });
                            }}
                            className="w-4 h-4 mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label
                            htmlFor={`emp-${emp._id}`}
                            className="text-sm text-gray-700 cursor-pointer select-none"
                          >
                            {emp.name}
                          </label>
                        </div>
                      ))}
                      {employees.filter(
                        (emp) => emp._id !== currentUser?.userData._id,
                      ).length === 0 && (
                        <div className="text-gray-500 text-sm text-center py-2">
                          No members available
                        </div>
                      )}
                    </div>
                    {formErrors.members && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.members}
                      </p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading
                      ? "Processing..."
                      : editingMeeting
                        ? "Update Meeting"
                        : "Create Meeting"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="mb-6 bg-gray-50 p-4 rounded-xl shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex items-center gap-2 flex-1 w-full relative">
              <Search className="absolute left-3 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search meetings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full bg-white border-gray-200 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Select value={dateFilter} onValueChange={handleDateFilterChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Meetings</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="tomorrow">Tomorrow</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
            {dateFilter === "custom" && (
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-auto"
                />
                <Input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-auto"
                />
              </div>
            )}
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setDateFilter("all");
                setCustomStartDate("");
                setCustomEndDate("");
              }}
              className="flex items-center gap-2 w-full md:w-auto"
            >
              <X className="w-4 h-4" /> Clear Filters
            </Button>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Meeting Title</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Create By</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Actions</TableHead>
                <TableHead className="text-right">Join</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMeetings.map((meeting) => (
                <TableRow key={meeting._id}>
                  <TableCell className="font-medium">
                    {meeting.meetTitle}
                  </TableCell>
                  <TableCell>
                    {new Date(meeting.meetDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell
                    className={`text-sm ${
                      isMeetingExpired(meeting.meetDate, meeting.meetTime)
                        ? "text-red-500"
                        : "text-gray-500"
                    }`}
                  >
                    {formatTime(meeting.meetTime)}
                  </TableCell>
                  <TableCell>
                    {" "}
                    {meeting.createdBy?.name ||
                      meeting.createdBy?.companyName ||
                      "N/A"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span>{meeting.members.length}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {isCompany ||
                        (isManager && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditModal(meeting)}
                              className="text-gray-600 hover:text-gray-800"
                              disabled={isMeetingExpired(
                                meeting.meetDate,
                                meeting.meetTime,
                              )}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDialog(meeting._id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        ))}
                      <DeleteConfirmationDialog
                        open={isDialogOpen}
                        onClose={closeDialog}
                        onConfirm={handleConfirmDelete}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      onClick={() => {
                        const baseRoute = isCompany
                          ? "/company/video-call"
                          : "/employee/video-call";
                        navigate(`${baseRoute}?roomID=${meeting.meetId}`);
                      }}
                      className={`${
                        isMeetingExpired(meeting.meetDate, meeting.meetTime)
                          ? "bg-gray-400 hover:bg-gray-500"
                          : "bg-blue-500 hover:bg-blue-600"
                      } text-white`}
                      disabled={isMeetingExpired(
                        meeting.meetDate,
                        meeting.meetTime,
                      )}
                    >
                      {isMeetingExpired(meeting.meetDate, meeting.meetTime) ? (
                        "Meeting Expired"
                      ) : (
                        <>
                          Join Meeting <Video className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredMeetings.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-gray-500"
                  >
                    No meetings found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-500">
            Showing {(page - 1) * pageSize + 1} to{" "}
            {Math.min(page * pageSize, meetings.length)} of {meetings.length}{" "}
            meetings
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MeetingManagement;
