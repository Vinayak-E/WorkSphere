import { NavLink } from "react-router-dom";
import { Home, Inbox, Settings, Users, FileText, BarChart } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import IMAGES from "@/assets/images/image";

const items = [
  {
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: Home,
  },
  {
    title: "Companies",
    url: "/admin/companiesList",
    icon: Users,
  },

  {
    title: "Requests",
    url: "/admin/requests",
    icon: FileText,
  },

  {
    title: "Subscription Plans",
    url: "/admin/subscriptions",
    icon: BarChart,
  },

];

export function AdminSidebar() {
  return (
    <Sidebar className="border-r bg-white h-screen flex flex-col ">
      <SidebarContent className="flex-1">
        <div className="flex h-16 items-center border-b px-6">
          <img
            src={IMAGES.navBarLogoDark}
            alt="Company Logo"
            className="h-12"
          />
        </div>

        <SidebarGroup className="flex-1">
          <SidebarGroupContent className="p-2">
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                          isActive && "bg-gray-100 text-gray-900",
                        )
                      }
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                      {item.badge && (
                        <span className="ml-auto rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-600">
                          {item.badge}
                        </span>
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
  );
}
