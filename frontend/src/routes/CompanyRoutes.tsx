import { Route, Routes } from 'react-router-dom'
import Layout from '@/components/company/CompanyLayout'
import Departments from '@/components/company/Departments'
import MyTeamC from '@/components/company/Team'


const CompanyRoutes = () => {
    return (
    <Routes>
       <Route element={ <Layout />} >
        <Route path="/" element={<Departments/>} />
        <Route path='/myteam' element={<MyTeamC/>}/>
        </Route>
    </Routes>
    )
  }
  
  export default CompanyRoutes