import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/api";
import { 
  Users, TrendingUp, CalendarCheck, AlertCircle, RefreshCw,
  Clock, BookOpen, GraduationCap, Megaphone, Filter, Layers, Calendar
} from "lucide-react";

const ACADEMIC_YEARS = [
  { label: "2025-26", start: "2025-04-01", end: "2026-03-31" },
  { label: "2026-27", start: "2026-04-01", end: "2027-03-31" },
];

export default function TeacherDashboard() {
  const { name } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    totalStudents: 0,
    classAverage: 0,
    attendancePercentage: 0,
    alerts: [],
    schedule: [],
    notices: [] 
  });
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);

  const [academicYear, setAcademicYear] = useState(() => {
    const now = new Date();
    const currentSession = ACADEMIC_YEARS.find(year => {
      const start = new Date(year.start);
      const end = new Date(year.end);
      return now >= start && now <= end;
    });

    const latestValidSession = currentSession?.label || ACADEMIC_YEARS[ACADEMIC_YEARS.length - 1].label;
    const saved = localStorage.getItem("academic_year_label");
    return saved || latestValidSession;
  });

  const [selectedClassId, setSelectedClassId] = useState(() => {
    const savedId = localStorage.getItem("teacher_dashboard_class_id");
    const savedTime = localStorage.getItem("teacher_dashboard_class_timestamp");

    if (savedId && savedTime && (Date.now() - parseInt(savedTime) < 3600000)) {
      return savedId;
    }
    return ""; 
  });

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const { data } = await api.get("/api/teacher/my-classes");
        setClasses(data || []);
      } catch (err) {
        console.error("Failed to fetch classes list");
      }
    };
    fetchClasses();
  }, []);

  const fetchData = useCallback(async () => {
    if (!selectedClassId || classes.length === 0) return;
    
    setLoading(true);
    try {
      const currentClass = classes.find(c => `${c.classGrade}-${c.section}-${c.subject}` === selectedClassId);
      if (!currentClass) return;

      const yearConfig = ACADEMIC_YEARS.find(y => y.label === academicYear);
      const query = `?classGrade=${currentClass.classGrade}&section=${currentClass.section}&subject=${encodeURIComponent(currentClass.subject)}&startDate=${yearConfig.start}&endDate=${yearConfig.end}`;
      
      const { data } = await api.get(`/api/teacher/stats${query}`);
      
      setStats({
        ...data,
        alerts: data?.alerts || [],
        schedule: data?.schedule || [],
        notices: data?.notices || []
      });
    } catch (err) {
      console.error("Failed to fetch dashboard stats", err);
    } finally {
      setLoading(false);
    }
  }, [selectedClassId, classes, academicYear]);

  useEffect(() => {
    fetchData();
    window.addEventListener("focus", fetchData);
    return () => window.removeEventListener("focus", fetchData);
  }, [fetchData]);

  const handleYearChange = (e) => {
    const val = e.target.value;
    setAcademicYear(val);
    localStorage.setItem("academic_year_label", val);
  };

  const handleClassChange = (e) => {
    const value = e.target.value;
    setSelectedClassId(value);
    if (value) {
      localStorage.setItem("teacher_dashboard_class_id", value);
      const classStr = value.split("-").slice(0, 2).join("-");
      localStorage.setItem("teacher_dashboard_class", classStr);
      localStorage.setItem("teacher_dashboard_class_timestamp", Date.now().toString());
    }
  };

  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });
  
  const getDisplayHeader = () => {
    const found = classes.find(c => `${c.classGrade}-${c.section}-${c.subject}` === selectedClassId);
    return found ? `Class ${found.classGrade}-${found.section} • ${found.subject}` : "Select Class";
  };

  // Only show full skeleton on initial load, not on background refresh
  if (loading && !stats.totalStudents) return <DashboardSkeleton />;

  return (
    // Natural flex layout on mobile. lg:h-full and lg:overflow-hidden locks the height on desktop.
    // pt-20 ensures the content is pushed exactly below the fixed Faculty Panel mobile header.
    <div className="flex-1 flex flex-col w-full lg:h-full lg:overflow-hidden p-4 pt-20 sm:p-6 sm:pt-24 md:p-8 font-sans pb-6 lg:pb-8">
      
      {/* --- HEADER SECTION --- */}
      <div className="shrink-0 mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 mb-6 md:mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Hello, {name?.split(' ')[0]} 👋</h1>
            <p className="text-gray-500 text-xs sm:text-sm font-medium mt-1">{todayStr} • {getDisplayHeader()}</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-auto">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-600" size={16} />
              <select 
                className="w-full sm:w-auto pl-10 pr-8 py-2.5 sm:py-2 bg-emerald-50 border-none rounded-xl text-sm font-bold text-emerald-700 outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer transition-all"
                value={academicYear}
                onChange={handleYearChange}
              >
                {ACADEMIC_YEARS.map(year => (
                  <option key={year.label} value={year.label}>Session {year.label}</option>
                ))}
              </select>
            </div>

            <div className="relative w-full sm:w-auto">
              <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <select 
                className="w-full sm:w-auto pl-10 pr-4 py-2.5 sm:py-2 bg-white border border-gray-100 rounded-xl text-sm font-bold text-gray-700 shadow-sm outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer transition-all"
                value={selectedClassId}
                onChange={handleClassChange}
              >
                <option value="">Switch Class</option>
                {classes.map((c, i) => (
                  <option key={i} value={`${c.classGrade}-${c.section}-${c.subject}`}>
                    {c.classGrade}-{c.section} ({c.subject})
                  </option>
                ))}
              </select>
            </div>

            {selectedClassId && (
              <button 
                onClick={fetchData} 
                className="w-full sm:w-auto flex justify-center p-2.5 sm:p-2 rounded-xl bg-white border border-gray-100 text-gray-400 hover:text-emerald-600 transition-all shadow-sm active:scale-95"
              >
                {/* Loader removed as requested */}
                <RefreshCw size={18} className="sm:w-5 sm:h-5" />
              </button>
            )}
          </div>
        </div>

        {!selectedClassId ? (
          <div className="bg-white p-8 sm:p-12 rounded-[1.5rem] sm:rounded-3xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-center">
             <div className="w-12 h-12 sm:w-16 sm:h-16 bg-emerald-50 text-emerald-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4">
                <Layers size={24} className="sm:w-8 sm:h-8" />
             </div>
             <h2 className="text-lg sm:text-xl font-bold text-gray-800">Select a Class</h2>
             <p className="text-gray-400 text-xs sm:text-sm mt-2 max-w-xs px-4">Please choose a class from the dropdown above to view student metrics and schedules.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <StatCard title="Total Students" value={stats.totalStudents} icon={<Users size={18} className="sm:w-5 sm:h-5" />} color="bg-blue-50 text-blue-600" />
            <StatCard title="Class Average" value={`${stats.classAverage}%`} icon={<TrendingUp size={18} className="sm:w-5 sm:h-5" />} color="bg-emerald-50 text-emerald-600" subtitle="Last Exam" />
            <StatCard title="Attendance" value={`${stats.attendancePercentage}%`} icon={<CalendarCheck size={18} className="sm:w-5 sm:h-5" />} color="bg-purple-50 text-purple-600" subtitle="This Month" />
          </div>
        )}
      </div>

      {/* --- SCROLLABLE CONTENT SECTION --- */}
      {selectedClassId && (
        <div className="flex flex-col flex-1 lg:min-h-0 lg:overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 w-full lg:h-full lg:min-h-0">
            
            {/* LEFT: ACTIONS & ALERTS */}
            <div className="lg:col-span-2 flex flex-col gap-5 sm:gap-6 lg:h-full lg:min-h-0">
              
              {/* Quick Actions */}
              <div className="shrink-0 bg-white p-5 sm:p-6 rounded-[1.5rem] sm:rounded-2xl shadow-sm border border-gray-50">
                <h3 className="font-bold text-gray-800 mb-4 sm:mb-5 flex items-center gap-2 uppercase text-[10px] sm:text-xs tracking-widest">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <QuickAction icon={<Users size={16} className="sm:w-[18px] sm:h-[18px]" />} label="Students" color="bg-blue-50 text-blue-600" onClick={() => navigate('/teacher/students')} />
                  <QuickAction icon={<CalendarCheck size={16} className="sm:w-[18px] sm:h-[18px]" />} label="Attendance" color="bg-emerald-50 text-emerald-600" onClick={() => navigate('/teacher/attendance')} />
                  <QuickAction icon={<GraduationCap size={16} className="sm:w-[18px] sm:h-[18px]" />} label="Marks" color="bg-orange-50 text-orange-600" onClick={() => navigate('/teacher/exams')} />
                  <QuickAction icon={<BookOpen size={16} className="sm:w-[18px] sm:h-[18px]" />} label="Routine" color="bg-purple-50 text-purple-600" onClick={() => navigate('/teacher/routine')} />
                </div>
              </div>

              {/* Notifications */}
              <div className="bg-white rounded-[1.5rem] sm:rounded-2xl shadow-sm border border-gray-50 flex flex-col lg:flex-1 lg:min-h-0 lg:overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/30 shrink-0">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2 uppercase text-[10px] sm:text-xs tracking-widest">
                    Teacher Notifications
                  </h3>
                  <AlertCircle size={16} className="text-red-400" />
                </div>
                {/* Desktop: Internal Scroll. Mobile: Natural stretch */}
                <div className="p-4 sm:p-5 space-y-3 sm:space-y-4 lg:flex-1 lg:overflow-y-auto custom-scrollbar">
                  {stats.alerts?.length > 0 ? (
                    stats.alerts.map((alert, i) => (
                      <div key={i} className="flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-red-50/50 border border-red-50 hover:bg-red-50 transition-colors group">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-red-500 shadow-sm shrink-0 group-hover:scale-110 transition-transform">
                          <AlertCircle size={14} className="sm:w-4 sm:h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-gray-800 truncate">{alert.title}</p>
                          <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 leading-relaxed">{alert.message}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-400 opacity-60 py-8 lg:h-full">
                        <Megaphone size={28} className="mb-2 sm:w-8 sm:h-8" />
                        <p className="text-[10px] sm:text-xs font-bold uppercase">No urgent alerts</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT: SCHEDULE & NOTICES */}
            <div className="lg:col-span-1 flex flex-col gap-5 sm:gap-6 lg:h-full lg:min-h-0">
              
              {/* Today's Schedule */}
              <div className="bg-white rounded-[1.5rem] sm:rounded-2xl shadow-sm border border-gray-50 flex flex-col lg:flex-[1.2] lg:min-h-0 lg:overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-gray-50 bg-gray-50/30 shrink-0">
                   <h3 className="font-bold text-gray-800 flex items-center gap-2 uppercase text-[10px] sm:text-xs tracking-widest">
                    Today's Schedule
                  </h3>
                </div>
                {/* Desktop: Internal Scroll. Mobile: Natural stretch */}
                <div className="p-4 sm:p-5 pr-1 sm:pr-2 lg:flex-1 lg:overflow-y-auto custom-scrollbar">
                   {stats.schedule?.length > 0 ? (
                     <div className="space-y-5 sm:space-y-6 relative ml-1 sm:ml-0">
                       <div className="absolute left-1.5 top-2 bottom-2 w-0.5 bg-gray-100"></div>
                       {stats.schedule.map((item, i) => (
                         <div key={i} className="relative pl-6 sm:pl-8">
                           <div className="absolute left-[-2px] top-1.5 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border-2 border-white bg-emerald-500 shadow-sm ring-2 sm:ring-4 ring-emerald-50"></div>
                           <p className="text-[9px] sm:text-[10px] font-black text-emerald-600 uppercase mb-1">{item.startTime}</p>
                           <h4 className="text-xs sm:text-sm font-bold text-gray-800">{item.subject}</h4>
                           <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase mt-0.5">Room {item.room || 'N/A'}</p>
                         </div>
                       ))}
                     </div>
                   ) : (
                     <div className="flex flex-col items-center justify-center text-gray-400 opacity-60 py-8 lg:h-full">
                       <CalendarCheck size={32} className="mb-3 sm:w-10 sm:h-10" />
                       <p className="text-center text-[10px] sm:text-xs font-bold uppercase mt-2">No Classes Today</p>
                     </div>
                   )}
                </div>
              </div>

              {/* Recent Notices */}
              <div className="shrink-0 bg-emerald-900 rounded-[1.5rem] sm:rounded-2xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-full -mr-12 -mt-12 sm:-mr-16 sm:-mt-16 pointer-events-none"></div>
                <h3 className="font-bold text-xs sm:text-sm mb-3 sm:mb-4 flex items-center gap-2 uppercase tracking-tighter relative z-10">
                  <Megaphone size={14} className="text-emerald-400 sm:w-4 sm:h-4" /> Recent Notices
                </h3>
                <div className="space-y-3 relative z-10">
                  {stats.notices?.slice(0, 2).map((n, i) => (
                    <div key={i} className="bg-white/10 p-3 rounded-xl border border-white/5 backdrop-blur-sm">
                      <p className="font-bold text-[10px] sm:text-xs truncate">{n.title}</p>
                      <p className="text-[9px] sm:text-[10px] text-emerald-200 mt-1 line-clamp-1">{n.content}</p>
                    </div>
                  ))}
                  <button onClick={() => navigate('/teacher/notices')} className="w-full mt-2 py-2.5 bg-white text-emerald-900 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-emerald-50 transition-colors active:scale-95 shadow-sm">
                    View Board
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

// --- SUB COMPONENTS ---

// REMOVED LOADER LOGIC entirely as requested
function StatCard({ title, value, icon, color, subtitle }) {
  return (
    <div className="bg-white p-4 sm:p-5 rounded-[1.25rem] sm:rounded-2xl shadow-sm border border-gray-50 flex items-center justify-between gap-2 min-w-0">
      <div className="min-w-0 flex-1">
        <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">{title}</p>
        <div className="flex items-baseline gap-2 mt-1 min-w-0">
          <p className="text-xl sm:text-2xl font-black text-gray-800 truncate">{value}</p>
          {subtitle && <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 truncate hidden sm:inline">{subtitle}</span>}
        </div>
      </div>
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl ${color} flex items-center justify-center shrink-0`}>{icon}</div>
    </div>
  );
}

function QuickAction({ icon, label, color, onClick }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl sm:rounded-2xl hover:bg-gray-50 transition-all group active:scale-95 border border-transparent hover:border-gray-100">
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl ${color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm shrink-0`}>
        {icon}
      </div>
      <span className="text-[9px] sm:text-[10px] font-bold text-gray-600 uppercase tracking-tighter truncate w-full text-center">{label}</span>
    </button>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col w-full max-w-6xl mx-auto lg:h-full lg:overflow-hidden px-4 pt-20 sm:px-6 sm:pt-24 md:pt-8 lg:p-8 animate-pulse">
      <div className="shrink-0 h-32 md:h-40 bg-gray-200 rounded-2xl md:rounded-[2rem] mb-6 md:mb-8"></div>
      <div className="shrink-0 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 md:mb-8">
        {[1,2,3,4].map(i => <div key={i} className="h-20 sm:h-24 bg-gray-200 rounded-xl sm:rounded-[1.5rem]"></div>)}
      </div>
      <div className="flex flex-col lg:flex-1 lg:min-h-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 lg:h-full lg:min-h-0">
          <div className="lg:col-span-2 flex flex-col gap-6 md:gap-8 lg:h-full lg:min-h-0">
            <div className="shrink-0 h-40 bg-gray-200 rounded-xl sm:rounded-[1.5rem]"></div>
            <div className="h-64 lg:flex-1 bg-gray-200 rounded-xl sm:rounded-[1.5rem] lg:min-h-0"></div>
          </div>
          <div className="lg:col-span-1 flex flex-col gap-6 md:gap-8 lg:h-full lg:min-h-0">
            <div className="h-64 lg:flex-[1.2] bg-gray-200 rounded-xl sm:rounded-[1.5rem] lg:min-h-0"></div>
            <div className="shrink-0 h-40 bg-gray-200 rounded-xl sm:rounded-[1.5rem]"></div>
          </div>
        </div>
      </div>
    </div>
  );
}