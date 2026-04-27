import { Routes, Route } from "react-router-dom";
import ParentLayout from "../layouts/ParentLayout";
import ParentDashboard from "../pages/parent/ParentDashboard";
import ParentAttendance from "../pages/parent/ParentAttendance";
import ParentFees from "../pages/parent/ParentFees";
import ParentProfile from "../pages/parent/ParentProfile";

// New Page Imports
import ParentExams from "../pages/parent/ParentExams";
import ParentSchedule from "../pages/parent/ParentSchedule";
import ParentNotices from "../pages/parent/ParentNotices";

export default function ParentRoutes() {
  return (
    <Routes>
      <Route element={<ParentLayout />}>
        {/* Main Dashboard */}
        <Route index element={<ParentDashboard />} />
        
        {/* Core Pages */}
        <Route path="attendance" element={<ParentAttendance />} />
        <Route path="fees" element={<ParentFees />} />
        <Route path="profile" element={<ParentProfile />} />
        <Route path="exams" element={<ParentExams />} />
        <Route path="schedule" element={<ParentSchedule />} />
        <Route path="notices" element={<ParentNotices />} />
      </Route>
    </Routes>
  );
}