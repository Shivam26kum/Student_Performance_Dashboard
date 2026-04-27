import { NavLink, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Layers, 
  LogOut, 
  GraduationCap, 
  Bell,
  IndianRupee,
  Clock,
  BookOpen,
  Settings,
  ShieldCheck,
  Wallet // New icon for Fee Setup
} from "lucide-react"; 
import { useAuth } from "../../context/AuthContext";

export default function AdminSidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const linkClass = ({ isActive }) => 
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
      isActive 
        ? "bg-white text-indigo-700 shadow-lg translate-x-1" 
        : "text-indigo-100 hover:bg-indigo-600 hover:text-white"
    }`;

  return (
    <aside className="w-64 bg-indigo-700 text-white min-h-screen p-6 hidden md:flex flex-col shadow-2xl z-20 shrink-0">
      
      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-10 px-2 shrink-0">
        <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-indigo-700 shadow-xl">
          <ShieldCheck size={24} strokeWidth={2.5} />
        </div>
        <div className="min-w-0">
          <h2 className="text-lg font-black leading-tight tracking-tight text-white truncate uppercase">
            Admin
          </h2>
          <p className="text-[10px] text-indigo-300 uppercase tracking-[0.2em] font-bold">
            School System
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-1 mb-10">
        <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-3 px-4 opacity-60">General</p>
        
        <NavLink to="/admin" end className={linkClass}>
          <LayoutDashboard size={18} /> Dashboard
        </NavLink>

        <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mt-6 mb-3 px-4 opacity-60">Human Resources</p>

        <NavLink to="/admin/teachers" className={linkClass}>
          <Users size={18} /> Teachers
        </NavLink>

        <NavLink to="/admin/students" className={linkClass}>
          <GraduationCap size={18} /> Students
        </NavLink>

        <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mt-6 mb-3 px-4 opacity-60">Academics</p>

        <NavLink to="/admin/classes" className={linkClass}>
          <Layers size={18} /> Class Rooms
        </NavLink>

        <NavLink to="/admin/schedules" className={linkClass}>
          <Clock size={18} /> Timetables
        </NavLink>

        <NavLink to="/admin/materials" className={linkClass}>
          <BookOpen size={18} /> All Materials
        </NavLink>

        <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mt-6 mb-3 px-4 opacity-60">Financial Control</p>

        {/* Updated: Added Fee Management to set the amounts per class */}
        <NavLink to="/admin/fee-setup" className={linkClass}>
          <Wallet size={18} /> Fee Management
        </NavLink>

        <NavLink to="/admin/finance" className={linkClass}>
          <IndianRupee size={18} /> Payment Records
        </NavLink>

        <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mt-6 mb-3 px-4 opacity-60">System</p>

        <NavLink to="/admin/notices" className={linkClass}>
          <Bell size={18} /> Notice Board
        </NavLink>

        <NavLink to="/admin/settings" className={linkClass}>
          <Settings size={18} /> Profile Settings
        </NavLink>
      </nav>

      {/* Logout Button */}
      <div className="border-t border-indigo-600/50 pt-6 mt-auto shrink-0">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-800/40 text-indigo-100 hover:bg-rose-600 hover:text-white transition-all duration-300 font-bold text-sm shadow-sm"
        >
          <LogOut size={18} /> Logout
        </button>
        <p className="text-indigo-400 text-[10px] font-bold text-center mt-6 uppercase tracking-widest opacity-50">© 2026 Shivam CSE</p>
      </div>
    </aside>
  );
}