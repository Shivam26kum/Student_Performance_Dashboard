import { Routes, Route, Outlet } from "react-router-dom";
import TeacherSidebar from "../components/teacher/TeacherSidebar";
import TeacherDashboard from "../pages/teacher/TeacherDashboard";
import TeacherStudents from "../pages/teacher/TeacherStudents";
import Attendance from "../pages/teacher/Attendance";
import TeacherNotice from "../pages/teacher/TeacherNotice"; 
import TeacherMarks from "../pages/teacher/TeacherMarks";

// --- NEW IMPORTS ---
import TeacherRoutine from "../pages/teacher/TeacherRoutine";
import TeacherMaterials from "../pages/teacher/TeacherMaterials";
import TeacherProfile from "../pages/teacher/TeacherProfile";

// --- RESTORED RESPONSIVE LAYOUT ---
const TeacherLayout = () => (
  <div className="flex h-screen w-full bg-gray-50 overflow-hidden">
    <TeacherSidebar />

    <div className="flex-1 flex flex-col h-full relative overflow-hidden">
      
      {/* Mobile: This main tag scrolls. Desktop: locks height so internal cards scroll */}
      <main className="flex-1 w-full h-full overflow-y-auto lg:overflow-hidden custom-scrollbar">
        
        {/* CRITICAL FIX: Padding (pt-24) is handled centrally here to clear the mobile header.
            min-h-full allows the page to stretch naturally on mobile. */}
        <div className="max-w-7xl mx-auto w-full h-auto min-h-full lg:h-full flex flex-col p-4 pt-24 sm:p-6 sm:pt-24 lg:p-8">
          <Outlet /> 
        </div>
        
      </main>
    </div>

    {/* Global custom scrollbar styling */}
    <style dangerouslySetInnerHTML={{__html: `
      .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
      .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
      .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
    `}} />
  </div>
);

export default function TeacherRoutes() {
  return (
    <Routes>
      <Route element={<TeacherLayout />}>
        {/* Core Menu */}
        <Route index element={<TeacherDashboard />} />
        <Route path="students" element={<TeacherStudents />} />
        <Route path="attendance" element={<Attendance />} />
        
        {/* Added: Class Routine */}
        <Route path="routine" element={<TeacherRoutine />} />

        {/* Academics */}
        <Route path="exams" element={<TeacherMarks />} /> 
        
        {/* Added: Study Materials */}
        <Route path="materials" element={<TeacherMaterials />} />

        {/* Communication & Profile */}
        <Route path="notices" element={<TeacherNotice />} />
        
        {/* Added: Teacher Profile */}
        <Route path="profile" element={<TeacherProfile />} />
      </Route>
    </Routes>
  );
}