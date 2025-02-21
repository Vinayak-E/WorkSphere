import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Calendar, PlusCircle, Users, Video, Pencil, Clock, Search, X, ArrowRight } from "lucide-react";
import { RootState } from "@/redux/store";
import { meetService } from "@/services/employee/meet.service";
import { chatService } from "@/services/employee/chat.service";
import { toast } from "react-toastify";
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

interface Member {
  _id: string;
  name: string;
  email: string;
}

interface Meeting {
  _id: string;
  meetTitle: string;
  meetDate: string;
  meetTime: string;
  isDaily: boolean;
  members: Member[];
  meetId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

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
    isDaily: false,
    members: [] as string[],
  });

  const currentUser = useSelector((state: RootState) => state.auth.user);
  const isManager = currentUser?.role === "MANAGER";

  useEffect(() => {
    fetchMeetings();
    if (isManager) {
      fetchEmployees();
    }
  }, [isManager]);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const res = await meetService.getMeetings();
      setMeetings(res.data);
    } catch (error) {
      toast.error("Failed to load meetings");
    } finally {
      setLoading(false);
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

  const handleCreateMeeting = async () => {
    try {
      setLoading(true);
      await meetService.createMeeting(meetingForm);
      toast.success("Meeting created successfully");
      fetchMeetings();
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      toast.error("Failed to create meeting");
    } finally {
      setLoading(false);
    }
  };

  const handleEditMeeting = async () => {
    if (!editingMeeting) return;
    
    try {
      setLoading(true);
      await meetService.updateMeeting(editingMeeting._id, meetingForm);
      toast.success("Meeting updated successfully");
      fetchMeetings();
      setShowEditModal(false);
      setEditingMeeting(null);
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
      isDaily: false,
      members: [],
    });
  };

  const openEditModal = (meeting: Meeting) => {
    setEditingMeeting(meeting);
    setMeetingForm({
      meetTitle: meeting.meetTitle,
      meetDate: meeting.meetDate,
      meetTime: meeting.meetTime,
      isDaily: meeting.isDaily,
      members: meeting.members.map(m => m._id),
    });
    setShowEditModal(true);
  };

  const joinMeeting = (meetId: string) => {
    window.location.href = `/join-meeting?meetId=${meetId}`;
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
                <form className="space-y-4">
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
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isDaily"
                      checked={meetingForm.isDaily}
                      onChange={(e) => setMeetingForm({ ...meetingForm, isDaily: e.target.checked })}
                      className="mr-2"
                    />
                    <label htmlFor="isDaily">Daily Meeting</label>
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
                    onClick={editingMeeting ? handleEditMeeting : handleCreateMeeting}
                  >
                    {editingMeeting ? "Update Meeting" : "Create Meeting"}
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
            <Button
              variant="outline"
              onClick={() => setSearchQuery("")}
              className="flex items-center gap-2 w-full md:w-auto"
            >
              <X className="w-4 h-4" /> Clear
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {filteredMeetings.map((meeting) => (
            <Card
              key={meeting._id}
              className="hover:shadow-md transition-all duration-500 border-gray-200 rounded-xl"
            >
              <CardContent className="p-6 rounded-xl">
                <div className="flex flex-col space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {meeting.meetTitle}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {meeting.isDaily ? "Daily Meeting" : "One-time Meeting"}
                      </p>
                    </div>
                    {isManager && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingMeeting(meeting);
                          setIsOpen(true);
                        }}
                      >
                        <Pencil className="w-4 h-4 text-gray-500 hover:text-blue-600" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>{meeting.meetTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{new Date(meeting.meetDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 col-span-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span>{meeting.members.length} members</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      className="w-full rounded-[5px] bg-primary/20 text-blue-700 hover:bg-primary transition-colors"
                      onClick={() => joinMeeting(meeting.meetId)}
                    >
                      Join Meeting <Video className="w-4 h-4 ml-2" />
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full rounded-[5px] bg-primary/20 text-blue-700 hover:bg-primary transition-colors"
                    >
                      View Details <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MeetingManagement;