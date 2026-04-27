import { NavLink, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Calendar, 
  CreditCard, 
  LogOut, 
  User, 
  Award, 
  Clock, 
  Bell 
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function ParentSidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const linkClass = ({ isActive }) => 
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
      isActive ? "bg-indigo-100 text-indigo-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
    }`;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-6 hidden md:flex flex-col">
      {/* Brand / Logo */}
      <div className="flex items-center gap-2 mb-8 px-2">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">P</div>
        <h2 className="text-xl font-bold text-gray-800">Parent Portal</h2>
      </div>

      {/* Navigation Links */}
      <nav className="space-y-2 flex-1">
        <NavLink to="/parent" end className={linkClass}>
          <LayoutDashboard size={20} /> Overview
        </NavLink>
        
        {/* Academics */}
        <NavLink to="/parent/attendance" className={linkClass}>
          <Calendar size={20} /> Attendance
        </NavLink>
        <NavLink to="/parent/exams" className={linkClass}>
          <Award size={20} /> Exam Records
        </NavLink>
        <NavLink to="/parent/schedule" className={linkClass}>
          <Clock size={20} /> Timetable
        </NavLink>

        {/* Administration */}
        <NavLink to="/parent/fees" className={linkClass}>
          <CreditCard size={20} /> Fees & Payments
        </NavLink>
        <NavLink to="/parent/notices" className={linkClass}>
          <Bell size={20} /> School Notices
        </NavLink>

        {/* Settings */}
        <NavLink to="/parent/profile" className={linkClass}>
          <User size={20} /> Profile
        </NavLink>
      </nav>

      {/* Footer / Logout */}
      <div className="border-t border-gray-100 pt-4">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors font-medium"
        >
          <LogOut size={20} /> LogOut
        </button>
        <p className="text-gray-400 text-xs text-center mt-4 font-medium tracking-wide">© 2026 SchoolApp</p>
      </div>
    </aside>
  );
}