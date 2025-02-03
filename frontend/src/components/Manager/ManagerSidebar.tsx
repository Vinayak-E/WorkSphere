import { NavLink } from "react-router-dom"
import { Calendar, Home, Inbox,  Settings, Users, FileText, BarChart ,ClipboardCheck } from "lucide-react"
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
    title: "Projects",
    url: "/employee/projects",
    icon: FileText,
  
  },
  {
    title: "Task Management",
    url: "/employee/tasks",
    icon: ClipboardCheck,
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
      className="border-r shadow-sm bg-white h-screen flex flex-col "
    > 
      <SidebarContent className="flex-1 bg-white">
        <SidebarHeader className="border-b-2 px-12 ">
          <div className="flex h-12 items-center">
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
                    isActive={location.pathname === item.url}
                  >
                    <NavLink to={item.url}>
                      <div className="flex min-w-[22px] items-center justify-center">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <span>{item.title}</span>
                      {item.badge && (
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

