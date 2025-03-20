import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, UserMinus, Users, X } from "lucide-react";
import { DialogContent } from "@radix-ui/react-dialog";
import { GroupMembersModalProps, IChatUser, IUser, MessageState} from "@/types/shared/IChat";




const GroupMembersModal: React.FC<GroupMembersModalProps> = ({
  isOpen,
  onClose,
  groupChat,
  allUsers,
  onlineUsers,
  currentUser,
  onAddMember,
  onRemoveMember,
}) => {
  const [activeTab, setActiveTab] = useState<string>("members");
  const [message, setMessage] = useState<MessageState | null>(null);

  const isGroupAdmin = groupChat.groupAdmin?.adminId._id === currentUser._id;

  const nonMembers = allUsers.filter(
    (user :IChatUser | IUser) =>
      !groupChat.users.some((member) => {
        const memberId = "userId" in member ? member.userId._id : member?._id;
        return memberId.toString() === user._id.toString();
      })
  ); 


  const handleAddMember = async (userId:string) => {
    try {
      await onAddMember(userId);
      setMessage({ type: "success", text: "Member added successfully!" });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: "error", text: "Failed to add member." });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleRemoveMember = async (userId :string) => {
    try {
      await onRemoveMember(userId);
      setMessage({ type: "success", text: "Member removed successfully!" });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: "error", text: "Failed to remove member." });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const renderUserItem = (user: IUser | { userId: IUser }, isGroupMember: boolean) => {
     const userData: IUser = "userId" in user ? user.userId : user;
    const isOnline = onlineUsers.includes(userData._id.toString());
    const isAdmin =
      userData._id.toString() === groupChat.groupAdmin?.adminId._id.toString();

    return (
      <div
        key={userData._id}
        className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
              {userData.profilePicture ? (
                <img
                  src={userData.profilePicture}
                  alt={userData.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                userData.name?.[0] || "?"
              )}
            </div>
            <span
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                isOnline ? "bg-green-500" : "bg-gray-400"
              }`}
            />
          </div>
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-900">{userData.name}</h3>
            {isAdmin && (
              <span className="bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                Admin
              </span>
            )}
            <p className="text-sm text-gray-500">{userData.email}</p>
          </div>
        </div>

        {isGroupAdmin &&
          userData._id.toString() !== currentUser._id.toString() && (
            <Button
              variant={isGroupMember ? "destructive" : "default"}
              size="sm"
              onClick={() =>
                isGroupMember
                  ? handleRemoveMember(userData._id)
                  : handleAddMember(userData._id)
              }
              className="flex items-center gap-2"
            >
              {isGroupMember ? (
                <>
                  <UserMinus className="h-4 w-4" />
                  Remove
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Add
                </>
              )}
            </Button>
          )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="fixed inset-y-0 right-0 w-full max-w-sm p-0 m-0 rounded-none bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 border-b relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-medium">
                {groupChat?.name[0]}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {groupChat.name}
                </h2>
                <p className="text-sm text-gray-500">
                  {groupChat.users.length} members
                </p>
              </div>
            </div>
          </div>

          {message && (
            <div
              className={`p-4 text-center ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
            >
              {message.text}
            </div>
          )}

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 flex flex-col"
          >
            <div className="px-6 border-b">
              <TabsList className="w-full justify-start gap-4">
                <TabsTrigger
                  value="members"
                  className="flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  Members
                </TabsTrigger>
                {isGroupAdmin && (
                  <TabsTrigger value="add" className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Add Members
                  </TabsTrigger>
                )}
              </TabsList>
            </div>

            <ScrollArea className="flex-1 p-6">
              <TabsContent value="members" className="m-0">
                <div className="space-y-2">
                  {groupChat.users.map((user) => renderUserItem(user, true))}
                </div>
              </TabsContent>

              {isGroupAdmin && (
                <TabsContent value="add" className="m-0">
                  <div className="space-y-2">
                    {nonMembers.map((user) => renderUserItem(user, false))}
                  </div>
                </TabsContent>
              )}
            </ScrollArea>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GroupMembersModal;
