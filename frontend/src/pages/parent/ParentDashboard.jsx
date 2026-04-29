import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getParentDashboardData } from "../../api/parentApi";
import { 
  User, CalendarCheck, TrendingUp, AlertCircle, 
  Clock, BookOpen, IndianRupee, Bell, ArrowRight
} from "lucide-react";

export default function ParentDashboard() {
  const { name } = useAuth();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getParentDashboardData();
        setData(res.data);
      } catch (err) {
        console.error("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatDate = (dateInput) => {
    const date = new Date(dateInput);
    return isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString();
  };

  if (loading) return <DashboardSkeleton />;
  
  if (!data || !data.student) return (
    <div className="flex flex-col items-center justify-center h-full text-gray-500 p-6 text-center">
      <AlertCircle size={48} className="mb-4 text-indigo-200" />
      <p className="font-bold text-gray-700">No student data linked to this account.</p>
      <p className="text-sm mt-1">Please contact the school administrator.</p>
    </div>
  );

  const { student, stats, recentPerformance, notices, schedule } = data;

  return (
    // Fixed: h-auto & overflow-visible on mobile for full-screen scroll, h-full & overflow-hidden on desktop
    <div className="h-auto lg:h-full flex flex-col max-w-6xl mx-auto overflow-visible lg:overflow-hidden p-4 sm:p-6 lg:px-8 py-6 sm:py-8 font-sans">
      
      {/* --- STATIC TOP SECTION --- */}
      <div className="shrink-0 mb-6 md:mb-8">
        
        {/* HEADER */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl md:rounded-[2rem] p-5 sm:p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 relative overflow-hidden mb-6 md:mb-8">
          <div className="absolute top-0 right-0 w-48 md:w-64 h-48 md:h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16 pointer-events-none"></div>
          
          <div className="relative z-10">
            <h1 className="text-xl sm:text-2xl font-bold mb-1">Welcome, {name}</h1>
            <p className="text-indigo-100 text-xs sm:text-sm">Overview for {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3 pr-5 sm:pr-6 rounded-xl sm:rounded-2xl flex items-center gap-3 sm:gap-4 border border-white/20 relative z-10 w-full md:w-auto">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white text-indigo-600 rounded-full flex items-center justify-center font-bold text-base sm:text-lg shadow-sm shrink-0">
              {student.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-base sm:text-lg leading-tight truncate">{student.name}</p>
              <p className="text-[10px] sm:text-xs text-indigo-200 truncate">Class {student.class}-{student.section} • Roll {student.rollNo}</p>
            </div>
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          <StatCard label="Attendance" value={`${stats.attendancePercentage}%`} icon={<CalendarCheck size={18} className="sm:w-5 sm:h-5" />} color="bg-emerald-50 text-emerald-600" />
          <StatCard label="Avg. Score" value={`${stats.averagePercentage}%`} icon={<TrendingUp size={18} className="sm:w-5 sm:h-5" />} color="bg-blue-50 text-blue-600" />
          <StatCard label="Fees Due" value={`₹${stats.feesPending}`} icon={<IndianRupee size={18} className="sm:w-5 sm:h-5" />} color={stats.feesPending > 0 ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"} />
          <StatCard label="Tests Taken" value={stats.totalTests} icon={<BookOpen size={18} className="sm:w-5 sm:h-5" />} color="bg-purple-50 text-purple-600" />
        </div>
      </div>

      {/* --- BOTTOM SECTION --- */}
      <div className="flex-1 flex flex-col lg:min-h-0 pb-2 overflow-visible lg:overflow-hidden custom-scrollbar">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 w-full h-auto lg:h-full lg:min-h-0">
          
          {/* LEFT COLUMN (2/3) */}
          <div className="lg:col-span-2 flex flex-col gap-6 md:gap-8 h-auto lg:h-full lg:min-h-0">
            
            {/* 1. DISTINCT DIV: Recent Performance */}
            <div className="bg-white rounded-xl sm:rounded-[1.5rem] shadow-sm border border-gray-100 flex flex-col lg:flex-[1.4] h-auto lg:min-h-0 overflow-hidden">
              <div className="shrink-0 p-4 sm:p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm sm:text-base">
                  <TrendingUp size={16} className="text-indigo-600 sm:w-[18px] sm:h-[18px]" /> Recent Results
                </h3>
                <button className="text-[10px] sm:text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 uppercase tracking-wider">
                  View All <ArrowRight size={12} />
                </button>
              </div>
              {/* Fixed: overflow-y-visible on mobile, overflow-y-auto on desktop */}
              <div className="flex-1 overflow-x-auto overflow-y-visible lg:overflow-y-auto custom-scrollbar">
                {recentPerformance.length > 0 ? (
                  <table className="w-full text-left text-sm min-w-[450px]">
                    <thead className="bg-gray-50/95 backdrop-blur-sm text-gray-500 lg:sticky top-0 z-10">
                      <tr>
                        <th className="p-4 font-bold text-xs uppercase tracking-wider whitespace-nowrap">Exam/Subject</th>
                        <th className="p-4 font-bold text-xs uppercase tracking-wider whitespace-nowrap">Date</th>
                        <th className="p-4 font-bold text-xs uppercase tracking-wider text-right whitespace-nowrap">Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {recentPerformance.map((perf, i) => (
                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                          <td className="p-4 font-medium text-gray-800 whitespace-nowrap">
                            <span className="block text-sm">{perf.examType || perf.examName}</span>
                            <span className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-wider">{perf.subject}</span>
                          </td>
                          <td className="p-4 text-gray-500 text-xs sm:text-sm whitespace-nowrap">{formatDate(perf.date || perf.createdAt)}</td>
                          <td className="p-4 text-right whitespace-nowrap">
                            <span className={`font-bold px-3 py-1.5 rounded-lg text-[10px] sm:text-xs inline-block ${
                              (perf.marksObtained / perf.totalMarks) >= 0.7 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                : 'bg-orange-50 text-orange-700 border border-orange-100'
                            }`}>
                              {perf.marksObtained}/{perf.totalMarks}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 py-10">
                    <BookOpen size={40} className="mb-3 opacity-20" />
                    <p className="text-sm font-medium">No exam results available yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* 2. DISTINCT DIV: Notice Board */}
            <div className="bg-white rounded-xl sm:rounded-[1.5rem] shadow-sm border border-gray-100 flex flex-col lg:flex-1 h-auto lg:min-h-0 overflow-hidden">
              <div className="shrink-0 p-4 sm:p-5 lg:p-6 pb-2 sm:pb-3 lg:pb-4 bg-white z-10">
                <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm sm:text-base">
                  <Bell size={16} className="text-orange-500 sm:w-[18px] sm:h-[18px]" /> School Notices
                </h3>
              </div>
              {/* Fixed: overflow-y-visible on mobile, overflow-y-auto on desktop */}
              <div className="flex-1 overflow-y-visible lg:overflow-y-auto custom-scrollbar space-y-3 sm:space-y-4 px-4 sm:px-5 lg:px-6 pb-4 sm:pb-5 lg:pb-6">
                {notices.length > 0 ? (
                  notices.map((notice, i) => (
                    <div key={i} className="flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-orange-50/50 border border-orange-100/50 hover:bg-orange-50 transition-colors">
                      <div className="mt-0.5 shrink-0">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                           <AlertCircle size={14} className="sm:w-4 sm:h-4" />
                        </div>
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-gray-800 text-xs sm:text-sm truncate">{notice.title}</h4>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed line-clamp-2">{notice.content}</p>
                        <p className="text-[9px] sm:text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-wider">
                          {formatDate(notice.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <p className="text-center text-gray-400 text-sm">No new notices.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (1/3) */}
          <div className="lg:col-span-1 flex flex-col gap-6 md:gap-8 h-auto lg:h-full lg:min-h-0">
            
            {/* 3. DISTINCT DIV: Today's Schedule */}
            <div className="bg-white rounded-xl sm:rounded-[1.5rem] shadow-sm border border-gray-100 flex flex-col lg:flex-[1.2] h-auto lg:min-h-0 overflow-hidden">
              <div className="shrink-0 p-4 sm:p-5 border-b border-gray-100 flex items-center bg-gray-50/50 z-10">
                <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm sm:text-base">
                  <Clock size={16} className="text-blue-600 sm:w-[18px] sm:h-[18px]" /> Today's Schedule
                </h3>
              </div>
              {/* Fixed: overflow-y-visible on mobile, overflow-y-auto on desktop */}
              <div className="flex-1 overflow-y-visible lg:overflow-y-auto custom-scrollbar p-4 sm:p-5 space-y-0 relative pr-1 sm:pr-2">
                <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-100"></div>
                {schedule.length > 0 ? (
                  schedule.map((item, i) => (
                    <div key={i} className="relative pl-8 sm:pl-10 py-3 group">
                      <div className="absolute left-[-2.5px] sm:left-[-1.5px] top-4 sm:top-4.5 w-2.5 h-2.5 bg-white border-2 border-blue-400 rounded-full z-10 group-hover:bg-blue-600 transition-colors"></div>
                      <p className="text-[10px] sm:text-xs font-bold text-blue-600 mb-1">{item.startTime}</p>
                      <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 group-hover:border-blue-200 group-hover:bg-blue-50/50 transition-all">
                        <p className="font-bold text-gray-800 text-xs sm:text-sm">{item.subject}</p>
                        <span className="text-[10px] sm:text-xs text-gray-500 font-medium">Room: {item.room || 'N/A'}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-gray-400 flex flex-col items-center justify-center">
                    <CalendarCheck size={32} className="mb-3 opacity-20 sm:w-10 sm:h-10" />
                    <p className="text-xs sm:text-sm font-medium">No classes scheduled today.</p>
                  </div>
                )}
              </div>
            </div>

            {/* 4. DISTINCT DIV: Quick Contact */}
            <div className="shrink-0 bg-indigo-900 rounded-xl sm:rounded-[1.5rem] p-4 sm:p-5 text-white text-center shadow-lg relative overflow-hidden">
               <div className="absolute -right-6 -top-6 w-20 h-20 bg-white opacity-5 rounded-full"></div>
               <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-2 text-indigo-300 relative z-10">
                  <User size={16} className="sm:w-5 sm:h-5" />
               </div>
               <h3 className="font-bold text-xs sm:text-sm mb-0.5 relative z-10">Contact Teacher</h3>
               <p className="text-[9px] sm:text-[10px] text-indigo-200 mb-3 px-2 relative z-10">Questions about {student.name}'s progress?</p>
               <button className="w-full bg-white text-indigo-900 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold hover:bg-indigo-50 transition shadow-sm relative z-10 active:scale-95">
                 Send Message
               </button>
            </div>

          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #e2e8f0; border-radius: 10px; }
        @media (min-width: 1024px) {
          .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        }
      `}} />
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-[1.5rem] border border-gray-100 shadow-sm flex items-center justify-between gap-2">
      <div className="min-w-0 flex-1">
        <p className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-wider truncate">{label}</p>
        <p className="text-lg sm:text-2xl font-black text-gray-800 mt-0.5 sm:mt-1 truncate">{value}</p>
      </div>
      <div className={`p-2.5 sm:p-3 rounded-lg sm:rounded-xl shrink-0 ${color}`}>
        {icon}
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    // Fixed: Skeleton also flows full height on mobile
    <div className="h-auto lg:h-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 animate-pulse flex flex-col w-full overflow-hidden">
      <div className="shrink-0 h-32 md:h-40 bg-gray-200 rounded-2xl md:rounded-[2rem] mb-6 md:mb-8"></div>
      <div className="shrink-0 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 md:mb-8">
        {[1,2,3,4].map(i => <div key={i} className="h-20 sm:h-24 bg-gray-200 rounded-xl sm:rounded-[1.5rem]"></div>)}
      </div>
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 lg:min-h-0 h-auto lg:h-full">
        <div className="lg:col-span-2 flex flex-col gap-6 md:gap-8 h-auto lg:h-full lg:min-h-0">
          <div className="lg:flex-[1.4] h-64 lg:h-auto bg-gray-200 rounded-xl sm:rounded-[1.5rem] lg:min-h-0"></div>
          <div className="lg:flex-1 h-64 lg:h-auto bg-gray-200 rounded-xl sm:rounded-[1.5rem] lg:min-h-0"></div>
        </div>
        <div className="lg:col-span-1 flex flex-col gap-6 md:gap-8 h-auto lg:h-full lg:min-h-0">
          <div className="lg:flex-[1.2] h-64 lg:h-auto bg-gray-200 rounded-xl sm:rounded-[1.5rem] lg:min-h-0"></div>
          <div className="shrink-0 h-32 bg-gray-200 rounded-xl sm:rounded-[1.5rem]"></div>
        </div>
      </div>
    </div>
  );
}