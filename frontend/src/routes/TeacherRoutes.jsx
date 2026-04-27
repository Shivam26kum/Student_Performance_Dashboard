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

const TeacherLayout = () => (
  <div className="flex h-screen bg-gray-100 overflow-hidden">
    <TeacherSidebar />
    <div className="flex-1 flex flex-col min-w-0">
      {/* Removing p-6 and overflow-y-auto from here 
          so individual pages can manage their own padding 
          and internal scroll areas.
      */}
      <main className="flex-1 h-full relative">
        <Outlet />
      </main>
    </div>
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