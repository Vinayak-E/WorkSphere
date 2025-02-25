import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/company/CompanySidebar"
import { Header } from "@/layouts/HeaderLayout"
import { Outlet } from "react-router-dom"

const Layout = () => {
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

export default Layout
