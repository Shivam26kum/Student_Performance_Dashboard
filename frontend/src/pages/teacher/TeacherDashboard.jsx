import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/api"; 
import { 
  Users, TrendingUp, CalendarCheck, AlertCircle, RefreshCw,
  Clock, BookOpen, GraduationCap, Megaphone, Filter, Layers, Calendar, ArrowRight
} from "lucide-react";

// --- ACADEMIC YEAR CONFIGURATION ---
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
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);

  // LOGIC: Automatically pick the current year based on today's date
  const [academicYear, setAcademicYear] = useState(() => {
    const now = new Date();
    const currentSession = ACADEMIC_YEARS.find(year => {
      const start = new Date(year.start);
      const end = new Date(year.end);
      return now >= start && now <= end;
    });

    // Default to current date session, fallback to last available session, then fallback to localstorage
    const latestValidSession = currentSession?.label || ACADEMIC_YEARS[ACADEMIC_YEARS.length - 1].label;
    const saved = localStorage.getItem("academic_year_label");
    
    return saved || latestValidSession;
  });

  const [selectedClassId, setSelectedClassId] = useState(() => {
    const savedId = localStorage.getItem("teacher_dashboard_class_id");
    const savedTime = localStorage.getItem("teacher_dashboard_class_timestamp");

    // Only keep the class selection if it's less than 1 hour old (fresh login usually clears this)
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

  return (
    <div className="h-full flex flex-col max-w-6xl mx-auto overflow-hidden p-4 font-sans">
      
      {/* --- HEADER SECTION --- */}
      <div className="shrink-0 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Hello, {name?.split(' ')[0]} 👋</h1>
            <p className="text-gray-500 text-sm font-medium mt-1">{todayStr} • {getDisplayHeader()}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 text-emerald-600" size={16} />
              <select 
                className="pl-10 pr-8 py-2 bg-emerald-50 border-none rounded-xl text-sm font-bold text-emerald-700 outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer"
                value={academicYear}
                onChange={handleYearChange}
              >
                {ACADEMIC_YEARS.map(year => (
                  <option key={year.label} value={year.label}>Session {year.label}</option>
                ))}
              </select>
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <select 
                className="pl-10 pr-4 py-2 bg-white border border-gray-100 rounded-xl text-sm font-bold text-gray-700 shadow-sm outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
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
                className={`p-2.5 rounded-xl bg-white border border-gray-100 text-gray-400 hover:text-emerald-600 transition-all shadow-sm ${loading ? 'animate-spin' : ''}`}
              >
                <RefreshCw size={18} />
              </button>
            )}
          </div>
        </div>

        {!selectedClassId ? (
          <div className="bg-white p-12 rounded-3xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-center">
             <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                <Layers size={32} />
             </div>
             <h2 className="text-xl font-bold text-gray-800">Select a Class</h2>
             <p className="text-gray-400 text-sm mt-2 max-w-xs">Please choose a class from the dropdown above to view student metrics and schedules.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard loading={loading} title="Total Students" value={stats.totalStudents} icon={<Users size={20} />} color="bg-blue-50 text-blue-600" />
            <StatCard loading={loading} title="Class Average" value={`${stats.classAverage}%`} icon={<TrendingUp size={20} />} color="bg-emerald-50 text-emerald-600" subtitle="Last Exam" />
            <StatCard loading={loading} title="Attendance" value={`${stats.attendancePercentage}%`} icon={<CalendarCheck size={20} />} color="bg-purple-50 text-purple-600" subtitle="This Month" />
          </div>
        )}
      </div>

      {/* --- SCROLLABLE CONTENT SECTION --- */}
      {selectedClassId && (
        <div className="flex-1 flex min-h-0 pb-2">
          <div className="grid lg:grid-cols-3 gap-6 w-full h-full min-h-0">
            
            {/* LEFT: ACTIONS & ALERTS */}
            <div className="lg:col-span-2 flex flex-col gap-6 h-full min-h-0">
              
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50">
                <h3 className="font-bold text-gray-800 mb-5 flex items-center gap-2 uppercase text-xs tracking-widest">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <QuickAction icon={<Users size={18}/>} label="Students" color="bg-blue-50 text-blue-600" onClick={() => navigate('/teacher/students')} />
                  <QuickAction icon={<CalendarCheck size={18}/>} label="Attendance" color="bg-emerald-50 text-emerald-600" onClick={() => navigate('/teacher/attendance')} />
                  <QuickAction icon={<GraduationCap size={18}/>} label="Marks" color="bg-orange-50 text-orange-600" onClick={() => navigate('/teacher/exams')} />
                  <QuickAction icon={<BookOpen size={18}/>} label="Routine" color="bg-purple-50 text-purple-600" onClick={() => navigate('/teacher/routine')} />
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-50 flex flex-col flex-1 min-h-0 overflow-hidden">
                <div className="p-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2 uppercase text-xs tracking-widest">
                    Teacher Notifications
                  </h3>
                  <AlertCircle size={16} className="text-red-400" />
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4">
                  {stats.alerts?.length > 0 ? (
                    stats.alerts.map((alert, i) => (
                      <div key={i} className="flex gap-4 p-4 rounded-xl bg-red-50/50 border border-red-50 hover:bg-red-50 transition-colors group">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-red-500 shadow-sm shrink-0 group-hover:scale-110 transition-transform">
                          <AlertCircle size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">{alert.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{alert.message}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
                        <Megaphone size={32} className="mb-2" />
                        <p className="text-xs font-bold uppercase">No urgent alerts</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT: SCHEDULE & NOTICES */}
            <div className="lg:col-span-1 flex flex-col gap-6 h-full min-h-0">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-50 flex flex-col flex-[1.2] min-h-0 overflow-hidden">
                <div className="p-5 border-b border-gray-50 bg-gray-50/30">
                   <h3 className="font-bold text-gray-800 flex items-center gap-2 uppercase text-xs tracking-widest">
                    Today's Schedule
                  </h3>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
                   {stats.schedule?.length > 0 ? (
                     <div className="space-y-6 relative">
                       <div className="absolute left-1.5 top-2 bottom-2 w-0.5 bg-gray-100"></div>
                       {stats.schedule.map((item, i) => (
                         <div key={i} className="relative pl-8">
                           <div className="absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white bg-emerald-500 shadow-sm ring-4 ring-emerald-50"></div>
                           <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">{item.startTime}</p>
                           <h4 className="text-sm font-bold text-gray-800">{item.subject}</h4>
                           <p className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">Room {item.room || 'N/A'}</p>
                         </div>
                       ))}
                     </div>
                   ) : (
                     <p className="text-center text-xs font-bold text-gray-400 mt-10 uppercase">No Classes</p>
                   )}
                </div>
              </div>

              <div className="bg-emerald-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden shrink-0">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <h3 className="font-bold text-sm mb-4 flex items-center gap-2 uppercase tracking-tighter">
                  <Megaphone size={16} className="text-emerald-400" /> Recent Notices
                </h3>
                <div className="space-y-3">
                  {stats.notices?.slice(0, 2).map((n, i) => (
                    <div key={i} className="bg-white/10 p-3 rounded-xl border border-white/5">
                      <p className="font-bold text-xs truncate">{n.title}</p>
                      <p className="text-[10px] text-emerald-200 mt-1 line-clamp-1">{n.content}</p>
                    </div>
                  ))}
                  <button onClick={() => navigate('/teacher/notices')} className="w-full py-2 bg-white text-emerald-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-50 transition-colors">
                    View Board
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #e2e8f0; border-radius: 10px; }
      `}} />
    </div>
  );
}

// --- SUB COMPONENTS ---

function StatCard({ title, value, icon, color, loading, subtitle }) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-50 flex items-center justify-between">
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{title}</p>
        {loading ? (
          <div className="h-7 w-16 bg-gray-100 animate-pulse rounded mt-2"></div>
        ) : (
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-2xl font-black text-gray-800">{value}</p>
            {subtitle && <span className="text-[10px] font-bold text-gray-400">{subtitle}</span>}
          </div>
        )}
      </div>
      <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center`}>{icon}</div>
    </div>
  );
}

function QuickAction({ icon, label, color, onClick }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-gray-50 transition-all group">
      <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}>
        {icon}
      </div>
      <span className="text-[10px] font-bold text-gray-600 uppercase tracking-tighter">{label}</span>
    </button>
  );
}