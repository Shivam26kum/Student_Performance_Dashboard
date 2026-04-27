import { Routes, Route } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";

import AdminDashboard from "../pages/admin/AdminDashboard";
import Classes from "../pages/admin/Classes";
import Teachers from "../pages/admin/Teachers";
import AdminStudents from "../pages/admin/AdminStudents";
import AdminNotices from "../pages/admin/AdminNotices";
import Finance from "../pages/admin/Finance";

// --- NEW PAGE IMPORTS ---
import AdminSchedules from "../pages/admin/AdminSchedules";
import AdminMaterials from "../pages/admin/AdminMaterials";
import AdminSettings from "../pages/admin/AdminSettings";
import AdminFeeSetup from "../pages/admin/AdminFeeSetup"; // <--- ADD THIS IMPORT

export default function AdminRoutes() {
  return (
    <Routes>
      {/* The Layout wraps all admin pages to keep the Sidebar static */}
      <Route element={<AdminLayout />}>
        
        {/* Main Dashboard: /admin */}
        <Route index element={<AdminDashboard />} />

        {/* Human Resources: /admin/teachers & /admin/students */}
        <Route path="teachers" element={<Teachers />} />
        <Route path="students" element={<AdminStudents />} />

        {/* Academics: /admin/classes, /admin/schedules, /admin/materials */}
        <Route path="classes" element={<Classes />} />
        <Route path="schedules" element={<AdminSchedules />} />
        <Route path="materials" element={<AdminMaterials />} />

        {/* Financial Control: /admin/fee-setup & /admin/finance */}
        {/* CRITICAL FIX: Matching the Sidebar NavLink to the Route path */}
        <Route path="fee-setup" element={<AdminFeeSetup />} /> 
        <Route path="finance" element={<Finance />} />

        {/* Administration: /admin/notices, /admin/settings */}
        <Route path="notices" element={<AdminNotices />} />
        <Route path="settings" element={<AdminSettings />} />

        {/* CATCH-ALL: Prevents white screens for broken links */}
        <Route path="*" element={
          <div className="h-full flex items-center justify-center font-black text-slate-300 uppercase tracking-widest">
            404 | Page Not Found
          </div>
        } />

      </Route>
    </Routes>
  );
}