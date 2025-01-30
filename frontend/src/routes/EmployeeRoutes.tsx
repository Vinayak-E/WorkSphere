import { Routes,Route, } from "react-router-dom"

import PasswordChange from "@/pages/Employee/PasswordChange"
import EmployeeLayout from "@/components/Employee/EmployeeLayout"
import EmployeeLeaves from "@/components/Employee/EmployeeLeaves"
import EmployeeProfile from "@/pages/Employee/Profile"
import ManagerLayout from "@/components/Manager/ManagerLayout"
import ManagerDashboard from "@/components/Manager/ManagerDashboard"
import EmployeeDashboard from "@/components/Employee/EmployeeDashboard"


const EmployeeRoutes = () => {
  return (
    <>
  <Routes>
      <Route path= '/passwordChange' element ={<PasswordChange />} />


       <Route element={ <EmployeeLayout />} >
       <Route path="/" element={<EmployeeDashboard/>} />
       <Route path="/leaves" element={<EmployeeLeaves/>} />
       <Route path="/profile" element={<EmployeeProfile/>} />
        </Route>

        <Route element={<ManagerLayout />}>
        <Route path="/dashboard" element={<ManagerDashboard />} />
        <Route path="/profile" element={<EmployeeProfile />} /> 
      </Route>



  </Routes>

    </>
  )
}

export default EmployeeRoutes