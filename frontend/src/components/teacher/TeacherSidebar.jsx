import { useState } from "react";
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
  ShieldCheck,
  Menu,
  X
} from "lucide-react"; 
import { useAuth } from "../../context/AuthContext";

export default function TeacherSidebar() {
  const { logout, name } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  const linkClass = ({ isActive }) => 
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
      isActive 
        ? "bg-white text-emerald-700 shadow-lg translate-x-1" 
        : "text-emerald-100 hover:bg-emerald-600 hover:text-white"
    }`;

  return (
    <>
      {/* --- MOBILE TOP BAR --- */}
      <div className="md:hidden flex items-center justify-between bg-emerald-700/95 backdrop-blur-md h-16 px-6 text-white shadow-md fixed top-0 w-full z-[50] transition-all">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-emerald-700 shadow-sm shrink-0">
             <ShieldCheck size={20} strokeWidth={2.5} />
          </div>
          <span className="font-black uppercase tracking-wider text-sm truncate">Faculty Panel</span>
        </div>
        <button 
          onClick={toggleSidebar}
          className="p-2 bg-emerald-600/50 rounded-xl hover:bg-emerald-500 transition-all active:scale-90 shrink-0"
          aria-label="Toggle Menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* --- BACKDROP (Mobile Only) --- */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] md:hidden animate-in fade-in duration-300"
          onClick={closeSidebar}
        />
      )}

      {/* --- SIDEBAR --- */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-[70]
        w-64 bg-emerald-700 text-white p-6 
        flex flex-col shadow-2xl shrink-0
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        h-full overflow-y-auto custom-sidebar-nav
      `}>
        
        {/* Brand Header (Desktop) */}
        <div className="flex items-center gap-3 mb-10 px-2 shrink-0">
          <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-emerald-700 shadow-xl shrink-0">
            <ShieldCheck size={24} strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-black leading-tight tracking-tight text-white truncate uppercase">
              {name?.split(' ')[0] || "Teacher"}
            </h2>
            <p className="text-[10px] text-emerald-300 uppercase tracking-[0.2em] font-bold truncate">
              Faculty Portal
            </p>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="space-y-1 flex-1">
          <p className="text-[10px] font-black text-emerald-300 uppercase tracking-widest mb-3 px-4 opacity-60">Main Menu</p>
          
          <NavLink to="/teacher" end className={linkClass} onClick={closeSidebar}>
            <LayoutDashboard size={18} /> Dashboard
          </NavLink>

          <NavLink to="/teacher/students" className={linkClass} onClick={closeSidebar}>
            <Users size={18} /> My Students
          </NavLink>

          <NavLink to="/teacher/attendance" className={linkClass} onClick={closeSidebar}>
            <CalendarCheck size={18} /> Attendance
          </NavLink>

          <NavLink to="/teacher/routine" className={linkClass} onClick={closeSidebar}>
            <Clock size={18} /> Class Routine
          </NavLink>

          <p className="text-[10px] font-black text-emerald-300 uppercase tracking-widest mt-6 mb-3 px-4 opacity-60">Academics</p>

          <NavLink to="/teacher/exams" className={linkClass} onClick={closeSidebar}>
            <TrendingUp size={18} /> Exams & Marks
          </NavLink>

          <NavLink to="/teacher/materials" className={linkClass} onClick={closeSidebar}>
            <FileText size={18} /> Study Materials
          </NavLink>

          <p className="text-[10px] font-black text-emerald-300 uppercase tracking-widest mt-6 mb-3 px-4 opacity-60">Communication</p>

          <NavLink to="/teacher/notices" className={linkClass} onClick={closeSidebar}>
            <Bell size={18} /> Notice Board
          </NavLink>

          <NavLink to="/teacher/profile" className={linkClass} onClick={closeSidebar}>
            <UserCircle size={18} /> My Profile
          </NavLink>
        </nav>

        {/* Footer & Logout Button */}
        <div className="border-t border-emerald-600/50 pt-6 mt-auto shrink-0">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center sm:justify-start gap-3 px-4 py-3 rounded-xl bg-emerald-800/40 text-emerald-100 hover:bg-rose-600 hover:text-white transition-all duration-300 font-bold text-sm shadow-sm active:scale-95"
          >
            <LogOut size={18} /> Logout
          </button>
          <p className="text-emerald-400 text-[10px] font-bold text-center mt-6 uppercase tracking-widest opacity-50">
            © 2026 Campus Connect
          </p>
        </div>

        {/* Sidebar-specific scrollbar injection */}
        <style dangerouslySetInnerHTML={{__html: `
          .custom-sidebar-nav::-webkit-scrollbar { width: 4px; }
          .custom-sidebar-nav::-webkit-scrollbar-track { background: transparent; }
          .custom-sidebar-nav::-webkit-scrollbar-thumb { background-color: rgba(255,255,255,0.15); border-radius: 10px; }
        `}} />
      </aside>
    </>
  );
}