import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import OtpVerification from "../pages/OtpVerification";
import ResetPassword from "../pages/ResetPassword";
import AdminRoutes from "./AdminRoutes";
import ProtectedRoute from "./ProtectedRoute";
import HomePage from "../pages/Home";
import CompanyRoutes from "./CompanyRoutes";
import EmployeeRoutes from "./EmployeeRoutes";
import AdminLogin from "@/pages/Admin/AdminLogin";
import PasswordChange from "@/pages/Employee/PasswordChange";
import ContactPage from "@/pages/Common/ContactPage";
import AboutPage from "@/pages/Common/AboutPage";
import PricingPage from "@/pages/Common/PrincingPage";

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/verifyOtp" element={<OtpVerification />} />
      <Route path="/resetPassword" element={<ResetPassword />} />
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/passwordChange" element={<PasswordChange />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/pricing" element={<PricingPage />} />

      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminRoutes />
          </ProtectedRoute>
        }
      />

      <Route
        path="/company/*"
        element={
          <ProtectedRoute allowedRoles={["COMPANY"]}>
            <CompanyRoutes />
          </ProtectedRoute>
        }
      />

      <Route
        path="/employee/*"
        element={
          <ProtectedRoute allowedRoles={["EMPLOYEE", "MANAGER"]}>
            <EmployeeRoutes />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
