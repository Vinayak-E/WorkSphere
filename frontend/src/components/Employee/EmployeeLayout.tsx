import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./Sidebar";
import { Header } from "./EmployeeHeader";
import { Outlet } from "react-router-dom";

const EmployeeLayout = () => {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen bg-gray-50">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default EmployeeLayout;
