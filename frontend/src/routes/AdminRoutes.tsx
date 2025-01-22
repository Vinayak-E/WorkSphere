import { Routes,Route, } from "react-router-dom"
import AdminLayout from "@/components/admin/AdminLayout"
import AdminDashboard from "@/components/admin/AdminDasboard"
import CompaniesList from "@/components/admin/CompaniesList"
import CompanyRequests from "@/components/admin/CompanyRequests"

const AdminRoutes = () => {
  return (
    <>
  <Routes>


  <Route element={ <AdminLayout />} >
        <Route path="/dashboard" element={<AdminDashboard/>} />
        <Route path='/companiesList' element={<CompaniesList />}/>
        <Route path='/requests' element={<CompanyRequests />}/>
        </Route>
  </Routes>

    </>
  )
}

export default AdminRoutes