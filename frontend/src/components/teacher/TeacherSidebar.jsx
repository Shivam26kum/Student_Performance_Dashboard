import { NavLink, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  TrendingUp, 
  LogOut, 
  Bell,
  Clock,
  UserCircle,
  FileText,
  ShieldCheck
} from "lucide-react"; 
import { useAuth } from "../../context/AuthContext";

export default function TeacherSidebar() {
  const { logout, name } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Modern active link styling
  const linkClass = ({ isActive }) => 
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
      isActive 
        ? "bg-white text-emerald-700 shadow-lg translate-x-1" 
        : "text-emerald-100 hover:bg-emerald-600 hover:text-white"
    }`;

  return (
    /* h-screen and sticky positioning ensures the sidebar doesn't scroll with the content */
    <aside className="w-64 bg-emerald-700 text-white h-screen sticky top-0 left-0 p-6 hidden md:flex flex-col shadow-2xl z-20 shrink-0 overflow-hidden">
      
      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-10 px-2 shrink-0">
        <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-emerald-700 shadow-xl">
          <ShieldCheck size={24} strokeWidth={2.5} />
        </div>
        <div className="min-w-0">
          <h2 className="text-lg font-black leading-tight tracking-tight text-white truncate uppercase">
            {name?.split(' ')[0] || "Teacher"}
          </h2>
          <p className="text-[10px] text-emerald-300 uppercase tracking-[0.2em] font-bold">
            Faculty Portal
          </p>
        </div>
      </div>
      
      {/* Navigation - Internal scroll only if items exceed height */}
      <nav className="space-y-1 flex-1 overflow-y-auto pr-2 custom-sidebar-nav">
        <p className="text-[10px] font-black text-emerald-300 uppercase tracking-widest mb-3 px-4 opacity-60">Main Menu</p>
        
        <NavLink to="/teacher" end className={linkClass}>
          <LayoutDashboard size={18} /> Dashboard
        </NavLink>

        <NavLink to="/teacher/students" className={linkClass}>
          <Users size={18} /> My Students
        </NavLink>

        <NavLink to="/teacher/attendance" className={linkClass}>
          <CalendarCheck size={18} /> Attendance
        </NavLink>

        <NavLink to="/teacher/routine" className={linkClass}>
          <Clock size={18} /> Class Routine
        </NavLink>

        <p className="text-[10px] font-black text-emerald-300 uppercase tracking-widest mt-6 mb-3 px-4 opacity-60">Academics</p>

        <NavLink to="/teacher/exams" className={linkClass}>
          <TrendingUp size={18} /> Exams & Marks
        </NavLink>

        <NavLink to="/teacher/materials" className={linkClass}>
          <FileText size={18} /> Study Materials
        </NavLink>

        <p className="text-[10px] font-black text-emerald-300 uppercase tracking-widest mt-6 mb-3 px-4 opacity-60">Communication</p>

        <NavLink to="/teacher/notices" className={linkClass}>
          <Bell size={18} /> Notice Board
        </NavLink>

        <NavLink to="/teacher/profile" className={linkClass}>
          <UserCircle size={18} /> My Profile
        </NavLink>
      </nav>

      {/* Logout Button - Anchored to bottom */}
      <div className="border-t border-emerald-600/50 pt-6 mt-auto shrink-0">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-800/40 text-emerald-100 hover:bg-rose-600 hover:text-white transition-all duration-300 font-bold text-sm shadow-sm"
        >
          <LogOut size={18} /> Logout
        </button>
        <p className="text-emerald-400 text-[10px] font-bold text-center mt-6 uppercase tracking-widest opacity-50">
          © 2026 SchoolApp
        </p>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-sidebar-nav::-webkit-scrollbar { width: 4px; }
        .custom-sidebar-nav::-webkit-scrollbar-track { background: transparent; }
        .custom-sidebar-nav::-webkit-scrollbar-thumb { background-color: rgba(255,255,255,0.1); border-radius: 10px; }
      `}} />
    </aside>
  );
}