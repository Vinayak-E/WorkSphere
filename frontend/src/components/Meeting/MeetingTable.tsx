import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { meetService } from "@/services/employee/meet.service";
import { toast } from "react-toastify";

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
  const [showModal, setShowModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [currentMeeting, setCurrentMeeting] = useState<string | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [newMeeting, setNewMeeting] = useState({
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
      console.error("Error fetching meetings", error);
      toast.error("Failed to load meetings");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      // Assuming you have an employeeService similar to meetService
      const res = await fetch('/api/employees');
      const data = await res.json();
      setEmployees(data.data || []);
    } catch (error) {
      console.error("Error fetching employees", error);
    }
  };

  const handleCreateMeeting = async () => {
    try {
      setLoading(true);
      await meetService.createMeeting(newMeeting);
      toast.success("Meeting created successfully");
      fetchMeetings();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error("Error creating meeting", error);
      toast.error("Failed to create meeting");
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
        console.error("Error deleting meeting", error);
        toast.error("Failed to delete meeting");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddMembers = async () => {
    if (!currentMeeting) return;
    
    try {
      setLoading(true);
      for (const memberId of selectedMembers) {
        await meetService.addMemberToMeeting(currentMeeting, memberId);
      }
      toast.success("Members added successfully");
      fetchMeetings();
      setShowMemberModal(false);
      setSelectedMembers([]);
    } catch (error) {
      console.error("Error adding members", error);
      toast.error("Failed to add members");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (meetingId: string, memberId: string) => {
    try {
      setLoading(true);
      await meetService.removeMemberFromMeeting(meetingId, memberId);
      toast.success("Member removed successfully");
      fetchMeetings();
    } catch (error) {
      console.error("Error removing member", error);
      toast.error("Failed to remove member");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNewMeeting({
      meetTitle: "",
      meetDate: "",
      meetTime: "",
      isDaily: false,
      members: [],
    });
  };

  const openMemberModal = (meetingId: string) => {
    setCurrentMeeting(meetingId);
    setShowMemberModal(true);
  };

  const handleMemberSelection = (memberId: string) => {
    setSelectedMembers(prev => {
      if (prev.includes(memberId)) {
        return prev.filter(id => id !== memberId);
      }
      return [...prev, memberId];
    });
  };

  const joinMeeting = (meetId: string) => {
    // Integrate with ZegoCloud UI Kit
    // Example: navigate to the meeting page with the meetId
    window.location.href = `/join-meeting?meetId=${meetId}`;
  };

  return (
    <div className="p-4 md:p-8">
      {/* Title and Manager Button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl md:text-2xl font-semibold">Meetings</h2>
        {isManager && (
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={() => setShowModal(true)}
          >
            Create New Meeting
          </button>
        )}
      </div>

      {/* Meeting List */}
      {loading && <div className="text-center py-4">Loading...</div>}
      
      {!loading && meetings.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No meetings scheduled. {isManager && "Create one to get started!"}
        </div>
      )}
      
      {!loading && meetings.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2 text-left">Title</th>
                <th className="border p-2 text-left">Date</th>
                <th className="border p-2 text-left">Time</th>
                <th className="border p-2 text-left">Type</th>
                <th className="border p-2 text-left">Members</th>
                <th className="border p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {meetings.map((meeting) => (
                <tr key={meeting._id} className="border hover:bg-gray-50">
                  <td className="border p-2">{meeting.meetTitle}</td>
                  <td className="border p-2">{new Date(meeting.meetDate).toLocaleDateString()}</td>
                  <td className="border p-2">{meeting.meetTime}</td>
                  <td className="border p-2">{meeting.isDaily ? "Daily" : "One-time"}</td>
                  <td className="border p-2">
                    <div className="flex flex-wrap gap-1">
                      {meeting.members.map(member => (
                        <div key={member._id} className="flex items-center bg-blue-100 px-2 py-1 rounded text-sm">
                          {member.name}
                          {isManager && (
                            <button 
                              className="ml-1 text-red-500 hover:text-red-700"
                              onClick={() => handleRemoveMember(meeting._id, member._id)}
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                      {isManager && (
                        <button 
                          className="text-blue-600 hover:text-blue-800 px-2 py-1 text-sm"
                          onClick={() => openMemberModal(meeting._id)}
                        >
                          + Add
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="border p-2">
                    <div className="flex space-x-2">
                      <button
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                        onClick={() => joinMeeting(meeting.meetId)}
                      >
                        Join
                      </button>
                      {isManager && (
                        <button
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                          onClick={() => handleDeleteMeeting(meeting._id)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for Creating Meeting */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-md w-96 max-w-full">
            <h3 className="text-lg font-semibold mb-4">Create New Meeting</h3>
            <input
              type="text"
              placeholder="Meeting Title"
              className="w-full p-2 border rounded mb-2"
              value={newMeeting.meetTitle}
              onChange={(e) => setNewMeeting({ ...newMeeting, meetTitle: e.target.value })}
            />
            <input
              type="date"
              className="w-full p-2 border rounded mb-2"
              value={newMeeting.meetDate}
              onChange={(e) => setNewMeeting({ ...newMeeting, meetDate: e.target.value })}
            />
            <input
              type="time"
              className="w-full p-2 border rounded mb-2"
              value={newMeeting.meetTime}
              onChange={(e) => setNewMeeting({ ...newMeeting, meetTime: e.target.value })}
            />
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="isDaily"
                className="mr-2"
                checked={newMeeting.isDaily}
                onChange={(e) => setNewMeeting({ ...newMeeting, isDaily: e.target.checked })}
              />
              <label htmlFor="isDaily">Daily Meeting</label>
            </div>
            
            <div className="mb-4">
              <label className="block mb-2">Select Members:</label>
              <div className="max-h-40 overflow-y-auto border rounded p-2">
                {employees.map(emp => (
                  <div key={emp._id} className="flex items-center mb-1">
                    <input
                      type="checkbox"
                      id={`emp-${emp._id}`}
                      checked={newMeeting.members.includes(emp._id)}
                      onChange={() => {
                        const updatedMembers = newMeeting.members.includes(emp._id)
                          ? newMeeting.members.filter(id => id !== emp._id)
                          : [...newMeeting.members, emp._id];
                        setNewMeeting({ ...newMeeting, members: updatedMembers });
                      }}
                      className="mr-2"
                    />
                    <label htmlFor={`emp-${emp._id}`}>{emp.name}</label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded-md mr-2 hover:bg-gray-600"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                onClick={handleCreateMeeting}
                disabled={loading}
              >
                {loading ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Adding Members */}
      {showMemberModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-md w-96 max-w-full">
            <h3 className="text-lg font-semibold mb-4">Add Members to Meeting</h3>
            
            <div className="max-h-60 overflow-y-auto border rounded p-2 mb-4">
              {employees.map(emp => (
                <div key={emp._id} className="flex items-center mb-1">
                  <input
                    type="checkbox"
                    id={`add-emp-${emp._id}`}
                    checked={selectedMembers.includes(emp._id)}
                    onChange={() => handleMemberSelection(emp._id)}
                    className="mr-2"
                  />
                  <label htmlFor={`add-emp-${emp._id}`}>{emp.name}</label>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end mt-4">
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded-md mr-2 hover:bg-gray-600"
                onClick={() => {
                  setShowMemberModal(false);
                  setSelectedMembers([]);
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                onClick={handleAddMembers}
                disabled={loading || selectedMembers.length === 0}
              >
                {loading ? "Adding..." : "Add Members"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingManagement;