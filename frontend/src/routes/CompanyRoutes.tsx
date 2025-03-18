import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "@/components/company/CompanyLayout";
import Departments from "@/components/company/Departments";
import MyTeamC from "@/components/company/Team";
import LeaveManagement from "@/components/company/LeaveManagement";
import AttendanceList from "@/components/company/AttendanceList";
import CompanyProfilePage from "@/components/company/CompanyProfilePage";
import ProjectList from "@/components/company/ProjectList";
import CompanyProjectDetails from "@/components/company/ProjectDetails";
import MeetingManagement from "@/components/Meeting/MeetingTable";
import VideoCall from "../components/Meeting/VideoCall";
import ChatContainer from "@/components/chat/chat";
import Dashboard from "@/components/company/Dashboard";
import SelectPlanPage from "@/components/company/SelectPlan";
import PaymentSuccessPage from "@/components/company/PaymentSuccessPage";
import CompanyTransactionsDashboard from "@/components/company/Transactions";


const CompanyRoutes = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/departments" element={<Departments />} />
        <Route path="/profile" element={<CompanyProfilePage />} />
        <Route path="/myteam" element={<MyTeamC />} />
        <Route path="/leaveRequests" element={<LeaveManagement />} />
        <Route path="/attendance" element={<AttendanceList />} />
        <Route path="/projects" element={<ProjectList />} />
        <Route path="/projects/:id" element={<CompanyProjectDetails />} />
        <Route path="/chat" element={<ChatContainer />} />
        <Route path="/meeting" element={<MeetingManagement />} />
        <Route path="/video-call" element={<VideoCall />} />
        <Route path="/payment/success" element={<PaymentSuccessPage />} />
        <Route path="/transactions" element={<CompanyTransactionsDashboard />} />
      </Route>
        <Route path="/select-plan" element={<SelectPlanPage />} />
    </Routes>
  );
};

export default CompanyRoutes;
