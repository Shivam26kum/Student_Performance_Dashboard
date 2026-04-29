import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Calendar, 
  CreditCard, 
  LogOut, 
  User, 
  Award, 
  Clock, 
  Bell,
  Menu,
  X 
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function ParentSidebar() {
  const { logout } = useAuth();
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
        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" 
        : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
    }`;

  return (
    <>
      {/* --- MOBILE TOP BAR --- */}
      <div className="md:hidden flex items-center justify-between bg-white h-16 px-6 border-b border-gray-100 fixed top-0 w-full z-[100]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-sm">P</div>
          <span className="font-bold text-gray-800 tracking-tight">Parent Portal</span>
        </div>
        <button 
          onClick={toggleSidebar}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* --- MOBILE BACKDROP --- */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] md:hidden animate-in fade-in duration-300"
          onClick={closeSidebar}
        />
      )}

      {/* --- SIDEBAR --- */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-[120]
        w-64 bg-white border-r border-gray-100 p-6 
        flex flex-col shadow-2xl md:shadow-none shrink-0
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        h-full overflow-y-auto custom-scrollbar
      `}>
        
        {/* Brand / Logo (Desktop) */}
        <div className="hidden md:flex items-center gap-3 mb-10 px-2 shrink-0">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-200">P</div>
          <h2 className="text-xl font-black text-gray-800 tracking-tight">Parent Portal</h2>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5 flex-1">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 px-4">Menu</p>
          
          <NavLink to="/parent" end className={linkClass} onClick={closeSidebar}>
            <LayoutDashboard size={20} /> Overview
          </NavLink>
          
          <NavLink to="/parent/attendance" className={linkClass} onClick={closeSidebar}>
            <Calendar size={20} /> Attendance
          </NavLink>
          
          <NavLink to="/parent/exams" className={linkClass} onClick={closeSidebar}>
            <Award size={20} /> Exam Records
          </NavLink>
          
          <NavLink to="/parent/schedule" className={linkClass} onClick={closeSidebar}>
            <Clock size={20} /> Timetable
          </NavLink>

          <NavLink to="/parent/fees" className={linkClass} onClick={closeSidebar}>
            <CreditCard size={20} /> Fees & Payments
          </NavLink>
          
          <NavLink to="/parent/notices" className={linkClass} onClick={closeSidebar}>
            <Bell size={20} /> School Notices
          </NavLink>

          <NavLink to="/parent/profile" className={linkClass} onClick={closeSidebar}>
            <User size={20} /> My Profile
          </NavLink>
        </nav>

        {/* Footer / Logout */}
        <div className="border-t border-gray-100 pt-6 mt-auto shrink-0">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-rose-50 hover:text-rose-600 transition-all font-bold text-sm"
          >
            <LogOut size={20} /> Sign Out
          </button>
          <p className="text-gray-400 text-[10px] text-center mt-6 font-bold uppercase tracking-[0.2em] opacity-60">© 2026 Campus Connect</p>
        </div>
      </aside>
    </>
  );
}