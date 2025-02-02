import { NavLink } from "react-router-dom"
import { Calendar, Home, Inbox,  Settings, Users, FileText, BarChart } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import IMAGES from "@/assets/images/image"

const items = [
  {
    title: "Dashboard",
    url: "/employee",
    icon: Home,
  },

  {
    title: "Leaves",
    url: "/employee/leaves",
    icon: Calendar,
  },
  {
    title: "Task Management",
    url: "/employee/tasks",
    icon: FileText,
  },
  {
    title: "Messages",
    url: "/messages",
    icon: Inbox,
     badge: 0,
  },
  {
    title: "Reports",
    url: "/analytics",
    icon: BarChart,
  },
  {
    title: "Settings",
    url: "/employee/profile",
    icon: Settings,
  },
]
export function AppSidebar() {
  return (
    <Sidebar 
      variant="sidebar" 
      collapsible="icon"
      className="border-r border-gray-100 shadow-sm bg-gradient-to-b from-gray-50 to-white"
    > 
      <SidebarContent className="flex-1 bg-white">

        <SidebarHeader className="border-b border-gray-100 px-12">
          <div className="flex h-16 items-center">
            <img src={IMAGES.navBarLogoDark} alt="Logo" className="h-12" />
          </div>
        </SidebarHeader>
        <SidebarGroup className="flex-1">
          <SidebarGroupContent className="p-2">
          <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    className="hover:bg-blue-50 text-gray-600 hover:text-blue-600"
                    isActive={location.pathname === item.url}
                  >
                    <NavLink 
                      to={item.url}
                      className={({ isActive }) => 
                        isActive ? "text-blue-600 bg-blue-50" : ""
                      }
                    >
                      <div className="flex min-w-[22px] items-center justify-center">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <span className="font-medium">{item.title}</span>
                      {item.badge !== undefined && (
                        <SidebarMenuBadge>
                          {item.badge}
                        </SidebarMenuBadge>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

