import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "./Sidebar"
import { Header } from "@/layouts/HeaderLayout"
import { Outlet } from "react-router-dom"

const EmployeeLayout = () => {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen">
        <AppSidebar  />
     
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-auto bg-gray-50">
            <div className="container mx-auto p-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default EmployeeLayout
