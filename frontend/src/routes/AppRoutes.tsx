import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import OtpVerification from "../pages/OtpVerification";
import ResetPassword from "../pages/ResetPassword";
// import DemoPageContent from "../pages/Dashboard";
import AdminRoutes from "./AdminRoutes";
import ProtectedRoute from "./ProtectedRoute";
import Layout from "@/components/company/CompanyLayout";
import Departments from "@/components/company/Departments";
import Home from "@/components/company/Home";
import HomePage from "../pages/Home";
import CompanyRoutes from "./CompanyRoutes";
import EmployeeRoutes from "./EmployeeRoutes";


const AppRoutes: React.FC = () => {
  return ( 
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verifyOtp" element={<OtpVerification />} />
        <Route path="/resetPassword" element={<ResetPassword />} />



        <Route element={ <Layout />} >
        <Route path="/dashboard" element={<Departments />} />
        <Route path='/home' element={<Home />}/>
        </Route>

  
        <Route path="/admin/*" element={<AdminRoutes />} />
        
        <Route
          path="/company/*"
          element={
           
              <CompanyRoutes />
     
          }
        />



  <Route
    path="/employee/*"
    element={
      
        <EmployeeRoutes />
 
    }
  />
{/* 
  Unauthorized Route
  <Route path="/unauthorized" element={<NotFound />} /> */}
</Routes>
    

  );
};

export default AppRoutes;
