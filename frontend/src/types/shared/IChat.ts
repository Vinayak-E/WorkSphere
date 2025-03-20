
export interface IUser {
    _id: string;
    name: string;
    email: string;
    employeeId: string;
    role:string;
    profilePicture ?:string;
    address?: {
      city?: string;
      state?: string;
      country?: string;
      [key: string]: any;
    };
  }
  
  export interface IChatUser {
    _id: string;
    id: string;
    name?:string;
    userId: IUser;
    userModel: string;
  }
  
  export interface IMessage {
    _id: string;
    id?: string;
    content: string;
    type: string;
    createdAt: string;
    updatedAt?: string;
    isRead: boolean;
    mediaUrl?: string | null;
    chat: IChat ;
    sender: {
        _id ?:string;
        name?:string;
      senderId?: IUser;
      senderModel?: string;
    };
    _beingMarkedAsRead?: boolean
  }


  export interface MediaUploadProps {
    onMediaSelect: (media: Media) => void;
    onClose: () => void;
  }

  export interface Media {
    type: "image" | "video";
    url: string;
  }
 



 
 
  
  export interface IChat {
    _id: string;
    id: string;
    name: string;
    chatName?: string;
    isGroupChat: boolean;
    latestMessage?: IMessage;
    createdAt: string;
    updatedAt: string;
    users: IChatUser[];
    groupAdmin?: {
        adminId: IUser;
      };
  }
  
  export interface ChatSidebarProps {
    chats: IChat[];
    selectedChat: IChat | null;
    setSelectedChat: (chat: IChat) => void;
    chatSearchTerm: string;
    setChatSearchTerm: (term: string) => void;
    currentUser: {
      userData:IUser ;
    };
    loadChats: () => Promise<void>;
    employees: IUser[];
    loadingEmployees: boolean;
    startNewChat: (employeeId: string) => void;
    onlineUsers: string[]; 
  }

  export interface ChatWindowProps {
    socket: any;
    selectedChat: IChat |  null;
    setSelectedChat: (chat: IChat) => void;
    messages: IMessage[];
    setMessages: React.Dispatch<React.SetStateAction<IMessage[]>>;
    isTyping: boolean;
    messageAreaRef: React.RefObject<HTMLDivElement>;
    currentUser: {
        userData:IUser ;
        tenantId?: string;
      };
    onlineUsers: string[];
    employees: IUser[];
    setChats: React.Dispatch<React.SetStateAction<IChat[]>>;
  }
  
 export interface MediaContent {
    type: "text" | "image" | "video";
    url?: string;
  }

  export interface GroupMembersModalProps {
    isOpen: boolean;
    onClose: () => void;
    groupChat: IChat;
    allUsers: IUser[];
    onlineUsers: string[];
    currentUser: IUser;
    onAddMember: (userId: string) => Promise<any>;
    onRemoveMember: (userId: string) => Promise<any>;
  }
  

export interface MessageState {
    type: "success" | "error";
    text: string;
  }