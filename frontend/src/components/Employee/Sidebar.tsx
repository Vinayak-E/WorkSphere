import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuBadge,
} from "@/components/ui/sidebar";
import { Home, Calendar, FileText, Inbox, Settings, Video } from "lucide-react";
import IMAGES from "@/assets/images/image";

const items = [
  { title: "Dashboard", url: "/employee", icon: Home },
  { title: "Leaves", url: "/employee/leaves", icon: Calendar },
  { title: "Task Management", url: "/employee/tasks", icon: FileText },
  { title: "Messages", url: "/employee/chat", icon: Inbox, badge: 0 },
  { title: "Meetings", url: "/employee/meeting", icon: Video },
  { title: "Settings", url: "/employee/profile", icon: Settings },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar
      variant="sidebar"
      collapsible="icon"
      className="
        min-h-screen 
        border-none 
        bg-white 
      
        shadow-lg shadow-blue-100
      "
    >
      <SidebarContent className="flex flex-col  bg-white">
        <SidebarHeader className="px-14 py-3 border-none ">
          <div className="flex items-center space-x-2">
            <img
              src={IMAGES.navBarLogoDark}
              alt="Logo"
              className="h-12 w-auto"
            />
          </div>
        </SidebarHeader>

        <SidebarGroup className="flex-1 overflow-y-auto">
          <SidebarGroupContent className="">
            <SidebarMenu>
              {items.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <NavLink
                      to={item.url}
                      className={`group flex items-center gap-2 rounded-md px-4 py-2 transition-colors
                        ${
                          isActive
                            ? // Active styles
                              "border-l-4 border-blue-600 bg-blue-50 text-blue-700 font-medium"
                            : // Default & hover
                              "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                        }
                      `}
                    >
                      <item.icon
                        className={`h-5 w-5 flex-shrink-0 
                          ${
                            isActive
                              ? "text-blue-600"
                              : "text-gray-400 group-hover:text-gray-600"
                          }
                        `}
                      />
                      <span className="whitespace-nowrap">{item.title}</span>

                      {item.badge !== undefined && (
                        <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                      )}
                    </NavLink>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
