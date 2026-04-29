import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, Users, Layers, LogOut, GraduationCap, 
  Bell, IndianRupee, Clock, BookOpen, Settings, 
  ShieldCheck, Wallet, Menu, X 
} from "lucide-react"; 
import { useAuth } from "../../context/AuthContext";

export default function AdminSidebar() {
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
        ? "bg-white text-indigo-700 shadow-lg translate-x-1" 
        : "text-indigo-100 hover:bg-indigo-600 hover:text-white"
    }`;

  return (
    <>
      {/* --- MOBILE TOP BAR --- */}
      <div className="md:hidden flex items-center justify-between bg-indigo-700/95 backdrop-blur-md h-16 px-6 text-white shadow-md fixed top-0 w-full z-[50] transition-all">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-indigo-700 shadow-sm shrink-0">
             <ShieldCheck size={20} strokeWidth={2.5} />
          </div>
          <span className="font-black uppercase tracking-wider text-sm truncate">Admin Panel</span>
        </div>
        <button 
          onClick={toggleSidebar}
          className="p-2 bg-indigo-600/50 rounded-xl hover:bg-indigo-500 transition-all active:scale-90 shrink-0"
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
        w-64 bg-indigo-700 text-white p-6 
        flex flex-col shadow-2xl shrink-0
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        h-full overflow-y-auto custom-sidebar-nav
      `}>
        
        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-10 px-2 shrink-0">
          <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-indigo-700 shadow-xl shrink-0">
            <ShieldCheck size={24} strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-black leading-tight tracking-tight text-white uppercase truncate">Admin</h2>
            <p className="text-[10px] text-indigo-300 uppercase tracking-[0.2em] font-bold truncate">School System</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1 mb-10 flex-1">
          <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-3 px-4 opacity-60">General</p>
          <NavLink to="/admin" end className={linkClass} onClick={closeSidebar}><LayoutDashboard size={18} /> Dashboard</NavLink>
          
          <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mt-6 mb-3 px-4 opacity-60">Human Resources</p>
          <NavLink to="/admin/teachers" className={linkClass} onClick={closeSidebar}><Users size={18} /> Teachers</NavLink>
          <NavLink to="/admin/students" className={linkClass} onClick={closeSidebar}><GraduationCap size={18} /> Students</NavLink>

          <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mt-6 mb-3 px-4 opacity-60">Academics</p>
          <NavLink to="/admin/classes" className={linkClass} onClick={closeSidebar}><Layers size={18} /> Class Rooms</NavLink>
          <NavLink to="/admin/schedules" className={linkClass} onClick={closeSidebar}><Clock size={18} /> Timetables</NavLink>
          <NavLink to="/admin/materials" className={linkClass} onClick={closeSidebar}><BookOpen size={18} /> All Materials</NavLink>

          <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mt-6 mb-3 px-4 opacity-60">Financial Control</p>
          <NavLink to="/admin/fee-setup" className={linkClass} onClick={closeSidebar}><Wallet size={18} /> Fee Management</NavLink>
          <NavLink to="/admin/finance" className={linkClass} onClick={closeSidebar}><IndianRupee size={18} /> Payment Records</NavLink>

          <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mt-6 mb-3 px-4 opacity-60">System</p>
          <NavLink to="/admin/notices" className={linkClass} onClick={closeSidebar}><Bell size={18} /> Notice Board</NavLink>
          <NavLink to="/admin/settings" className={linkClass} onClick={closeSidebar}><Settings size={18} /> Profile Settings</NavLink>
        </nav>

        {/* Footer Area */}
        <div className="border-t border-indigo-600/50 pt-6 mt-auto shrink-0">
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center justify-center sm:justify-start gap-3 px-4 py-3 rounded-xl bg-indigo-800/40 text-indigo-100 hover:bg-rose-600 hover:text-white transition-all font-bold text-sm shadow-sm active:scale-95"
          >
            <LogOut size={18} /> Logout
          </button>
          <p className="text-indigo-400 text-[10px] font-bold text-center mt-6 uppercase tracking-widest opacity-50">© 2026 Shivam CSE</p>
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