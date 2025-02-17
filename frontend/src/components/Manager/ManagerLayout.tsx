import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "./ManagerSidebar"
import { Header } from "../Employee/EmployeeHeader"
import { Outlet } from "react-router-dom"

const ManagerLayout = () => {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen">
        <AppSidebar  />
     
        <div className="flex flex-col flex-1 overflow-hidden bg-gradient-to-r from-gray-50 to-gray-100">
          <Header />
          <main className="flex-1 overflow-auto bg-gray-">

              <Outlet />
    
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default ManagerLayout
