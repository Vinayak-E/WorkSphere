import { Routes,Route, } from "react-router-dom"

import EmployeeLayout from "@/components/Employee/EmployeeLayout"
import EmployeeLeaves from "@/components/Employee/EmployeeLeaves"
import EmployeeProfile from "@/pages/Employee/Profile"
import ManagerLayout from "@/components/Manager/ManagerLayout"
import EmployeeDashboard from "@/components/Employee/EmployeeDashboard"
import { RootState } from "@/redux/store"
import { useSelector } from "react-redux"
import ProjectList from "@/components/Manager/Projects"
import ProjectDetails from "@/components/Manager/ProjectDetails"

const EmployeeRoutes = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const isManager = user?.role === "MANAGER"; 

  return (
    <Routes>

      {!isManager ? (
        <Route element={<EmployeeLayout />}>
          <Route path="/" element={<EmployeeDashboard />} />
          <Route path="/leaves" element={<EmployeeLeaves />} />
          <Route path="/profile" element={<EmployeeProfile />} />
          <Route path="/projects/:id" element={<ProjectDetails />} />
        </Route>
      ) : (
        
        <Route element={<ManagerLayout />}>
           <Route path="/" element={<EmployeeDashboard />} />
           <Route path="/leaves" element={<EmployeeLeaves />} />
          <Route path="/profile" element={<EmployeeProfile />} />
          <Route path="/projects" element={<ProjectList />} />
          <Route path="/projects/:id" element={<ProjectDetails />} />
        </Route>
      )}
    </Routes>
  );
};

export default EmployeeRoutes;
