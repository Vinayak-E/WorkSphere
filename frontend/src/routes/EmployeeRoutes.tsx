import { Routes,Route, } from "react-router-dom"
import AdminLayout from "@/components/admin/AdminLayout"
import AdminDashboard from "@/components/admin/AdminDasboard"
import CompaniesList from "@/components/admin/CompaniesList"
import CompanyRequests from "@/components/admin/CompanyRequests"
import PasswordChange from "@/pages/Employee/PasswordChange"
import EmployeeProfile from "@/pages/Employee/EmployeeProfile"

const EmployeeRoutes = () => {
  return (
    <>
  <Routes>
      <Route path= '/passwordChange' element ={<PasswordChange />} />
      <Route path="/" element={<EmployeeProfile />}/>
  <Route element={ <AdminLayout />} >
        <Route path="/dashboard" element={<AdminDashboard/>} />
        <Route path='/companiesList' element={<CompaniesList />}/>
        <Route path='/requests' element={<CompanyRequests />}/>
        </Route>
  </Routes>

    </>
  )
}

export default EmployeeRoutes