import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Calendar, PlusCircle, Users, Video, Pencil, Clock, Search, X, ArrowRight, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { RootState } from "@/redux/store";
import { meetService } from "@/services/employee/meet.service";
import { chatService } from "@/services/employee/chat.service";
import { toast } from "react-hot-toast"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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





const MeetingManagement: React.FC = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [employees, setEmployees] = useState<Member[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
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
  const pageSize = 10;
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const isManager = currentUser?.role === "MANAGER";
const navigate = useNavigate()
  useEffect(() => {
    fetchMeetings();
    if (isManager) {
      fetchEmployees();
    }
  }, [isManager]);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        pageSize,
        dateFilter,
        startDate: customStartDate,
        endDate: customEndDate
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

  const handleDateFilterChange = (value: string) => {
    setDateFilter(value);
    setPage(1);
    if (value !== "custom") {
      setCustomStartDate("");
      setCustomEndDate("");
    }
  };
  const filteredMeetings = meetings.filter(meeting =>
    meeting.meetTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fetchEmployees = async () => {
    try {
      const res = await chatService.getAllEmployees();
      setEmployees(res.data || []);
    } catch (error) {
      toast.error("Failed to fetch employees");
    }
  };

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
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
    if (!editingMeeting) return;
    
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

  const handleDeleteMeeting = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this meeting?")) {
      try {
        setLoading(true);
        await meetService.deleteMeeting(id);
        toast.success("Meeting deleted successfully");
        fetchMeetings();
      } catch (error) {
        toast.error("Failed to delete meeting");
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setMeetingForm({
      meetTitle: "",
      meetDate: "",
      meetTime: "",
      members: [],
    });
  };

  const openEditModal = (meeting: Meeting) => {
    setEditingMeeting(meeting);
    setMeetingForm({
      meetTitle: meeting.meetTitle,
      meetDate: meeting.meetDate,
      meetTime: meeting.meetTime,
      members: meeting.members.map(m => m._id),
    });
    setIsOpen(true);
  };

  
  return (
    <Card className="w-full max-w-6xl mx-auto border-gray-200 shadow-xl rounded-xl mt-6">
      <CardHeader className="bg-gradient-to-r from-blue-100 to-blue-200 px-6 py-4 border-b-gray-50 rounded-t-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-600" />
              Meetings
            </CardTitle>
            <p className="text-sm text-gray-500">Schedule and manage your meetings efficiently</p>
          </div>
          {isManager && (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="shadow-md hover:shadow-lg transition-shadow">
                  <PlusCircle size={18} className="mr-2" /> New Meeting
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-lg">
                    {editingMeeting ? "Edit Meeting" : "Create New Meeting"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={editingMeeting ? handleEditMeeting : handleCreateMeeting} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Meeting Title</label>
                    <Input
                      value={meetingForm.meetTitle}
                      onChange={(e) => setMeetingForm({ ...meetingForm, meetTitle: e.target.value })}
                      required
                      className="focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Date</label>
                    <Input
                      type="date"
                      value={meetingForm.meetDate}
                      onChange={(e) => setMeetingForm({ ...meetingForm, meetDate: e.target.value })}
                      required
                      className="focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Time</label>
                    <Input
                      type="time"
                      value={meetingForm.meetTime}
                      onChange={(e) => setMeetingForm({ ...meetingForm, meetTime: e.target.value })}
                      required
                      className="focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
            
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Select Members</label>
                    <div className="max-h-40 overflow-y-auto border rounded-lg p-2">
                      {employees.map((emp) => (
                        <div key={emp._id} className="flex items-center mb-1">
                          <input
                            type="checkbox"
                            id={`emp-${emp._id}`}
                            checked={meetingForm.members.includes(emp._id)}
                            onChange={() => {
                              const updatedMembers = meetingForm.members.includes(emp._id)
                                ? meetingForm.members.filter((id) => id !== emp._id)
                                : [...meetingForm.members, emp._id];
                              setMeetingForm({
                                ...meetingForm,
                                members: updatedMembers,
                              });
                            }}
                            className="mr-2"
                          />
                          <label htmlFor={`emp-${emp._id}`}>{emp.name}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? "Processing..." : (editingMeeting ? "Update Meeting" : "Create Meeting")}
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
                <TableHead>Date & Time</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Actions</TableHead>
                <TableHead className="text-right">Join</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMeetings.map((meeting) => (
                <TableRow key={meeting._id}>
                  <TableCell className="font-medium">{meeting.meetTitle}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{new Date(meeting.meetDate).toLocaleDateString()}</span>
                      <span className="text-sm text-gray-500">{meeting.meetTime}</span>
                    </div>
                  </TableCell>
                 
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span>{meeting.members.length}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {isManager && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(meeting)}
                            className="text-gray-600 hover:text-gray-800"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteMeeting(meeting._id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                     onClick={() =>
                      navigate(`/employee/video-call?roomID=${meeting.meetId}`)
                    }
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      Join Meeting <Video className="w-4 h-4 ml-2" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-500">
            Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, meetings.length)} of {meetings.length} meetings
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