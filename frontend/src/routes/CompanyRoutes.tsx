import { Route, Routes } from 'react-router-dom'
import Layout from '@/components/company/CompanyLayout'
import Departments from '@/components/company/Departments'
import MyTeamC from '@/components/company/Team'
import LeaveManagement from '@/components/company/LeaveManagement'
import AttendanceList from '@/components/company/AttendanceList'
import CompanyProfilePage from '@/components/company/CompanyProfilePage'
import ProjectList from '@/components/company/ProjectList'


const CompanyRoutes = () => {
    return (
    <Routes>
       <Route element={ <Layout />} >
        <Route path="/" element={<Departments/>} />
        <Route path="/profile" element={<CompanyProfilePage/>} />
        <Route path='/myteam' element={<MyTeamC/>}/>
        <Route path='/leaveRequests' element={<LeaveManagement/>}/>
        <Route path='/attendance' element={<AttendanceList/>}/>
        <Route path='/projects' element={<ProjectList/>}/>
        
        </Route>
    </Routes>
    )
  }
  
  export default CompanyRoutes