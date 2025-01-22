import { Route, Routes } from 'react-router-dom'
import Layout from '@/components/company/CompanyLayout'
import Departments from '@/components/company/Departments'
import MyTeam from '@/components/company/MyTeam'


const CompanyRoutes = () => {
    return (
    <Routes>
       <Route element={ <Layout />} >
        <Route path="/" element={<Departments/>} />
        <Route path='/myteam' element={<MyTeam />}/>
        </Route>
    </Routes>
    )
  }
  
  export default CompanyRoutes