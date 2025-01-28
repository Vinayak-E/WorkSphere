import { Routes,Route, } from "react-router-dom"

import PasswordChange from "@/pages/Employee/PasswordChange"
import EmployeeLayout from "@/components/Employee/EmployeeLayout"
import EmployeeLeaves from "@/components/Employee/EmployeeLeaves"
import EmployeeProfile from "@/pages/Employee/Profile"


const EmployeeRoutes = () => {
  return (
    <>
  <Routes>
      <Route path= '/passwordChange' element ={<PasswordChange />} />
       <Route element={ <EmployeeLayout />} >

       <Route path="/" element={<EmployeeLeaves/>} />
       <Route path="/profile" element={<EmployeeProfile/>} />
        </Route>
  </Routes>

    </>
  )
}

export default EmployeeRoutes