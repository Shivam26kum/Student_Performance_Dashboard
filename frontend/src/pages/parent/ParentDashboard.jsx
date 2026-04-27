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

  // Helper function to handle potential null or unusual date formats
  const formatDate = (dateInput) => {
    const date = new Date(dateInput);
    return isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString();
  };

  if (loading) return <DashboardSkeleton />;
  
  if (!data || !data.student) return (
    <div className="flex flex-col items-center justify-center h-full text-gray-500">
      <AlertCircle size={48} className="mb-4 text-indigo-200" />
      <p>No student data linked to this account.</p>
      <p className="text-sm">Please contact the school administrator.</p>
    </div>
  );

  const { student, stats, recentPerformance, notices, schedule } = data;

  return (
    <div className="h-full flex flex-col max-w-6xl mx-auto overflow-hidden p-4 font-sans">
      
      {/* --- STATIC TOP SECTION --- */}
      <div className="shrink-0 mb-6">
        
        {/* HEADER */}
        <div className="bg-linear-to-r from-indigo-600 to-blue-600 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden mb-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16"></div>
          
          <div className="relative z-10">
            <h1 className="text-2xl font-bold mb-1">Welcome, {name}</h1>
            <p className="text-indigo-100 text-sm">Overview for {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3 pr-6 rounded-xl flex items-center gap-4 border border-white/20 relative z-10">
            <div className="w-12 h-12 bg-white text-indigo-600 rounded-full flex items-center justify-center font-bold text-lg shadow-sm">
              {student.name.charAt(0)}
            </div>
            <div>
              <p className="font-bold text-lg leading-tight">{student.name}</p>
              <p className="text-xs text-indigo-200">Class {student.class}-{student.section} • Roll {student.rollNo}</p>
            </div>
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard 
            label="Attendance" 
            value={`${stats.attendancePercentage}%`} 
            icon={<CalendarCheck size={20} />} 
            color="bg-emerald-50 text-emerald-600"
          />
          <StatCard 
            label="Avg. Score" 
            value={`${stats.averagePercentage}%`} 
            icon={<TrendingUp size={20} />} 
            color="bg-blue-50 text-blue-600"
          />
          <StatCard 
            label="Fees Due" 
            value={`₹${stats.feesPending}`} 
            icon={<IndianRupee size={20} />} 
            color={stats.feesPending > 0 ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}
          />
          <StatCard 
            label="Tests Taken" 
            value={stats.totalTests} 
            icon={<BookOpen size={20} />} 
            color="bg-purple-50 text-purple-600"
          />
        </div>
      </div>

      {/* --- BOTTOM SECTION --- */}
      <div className="flex-1 flex min-h-0 pb-2">
        <div className="grid lg:grid-cols-3 gap-8 w-full h-full min-h-0">
          
          {/* LEFT COLUMN (2/3) */}
          <div className="lg:col-span-2 flex flex-col gap-6 h-full min-h-0">
            
            {/* 1. Recent Performance - EXPANDED SIZE (flex-grow) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col flex-[1.4] min-h-0 overflow-hidden">
              <div className="shrink-0 p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <TrendingUp size={18} className="text-indigo-600" /> Recent Results
                </h3>
                <button className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                  View All <ArrowRight size={12} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {recentPerformance.length > 0 ? (
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500 sticky top-0 z-10">
                      <tr>
                        <th className="p-4 font-medium">Exam/Subject</th>
                        <th className="p-4 font-medium">Date</th>
                        <th className="p-4 font-medium text-right">Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {recentPerformance.map((perf, i) => (
                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                          <td className="p-4 font-medium text-gray-800">
                            <span className="block">{perf.examType || perf.examName}</span>
                            <span className="text-xs text-gray-500 font-normal">{perf.subject}</span>
                          </td>
                          {/* FIX: Checks both .date and .createdAt for the timestamp */}
                          <td className="p-4 text-gray-500">{formatDate(perf.date || perf.createdAt)}</td>
                          <td className="p-4 text-right">
                            <span className={`font-bold px-3 py-1 rounded-lg text-xs ${
                              (perf.marksObtained / perf.totalMarks) >= 0.7 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-orange-100 text-orange-700'
                            }`}>
                              {perf.marksObtained}/{perf.totalMarks}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <BookOpen size={48} className="mb-2 opacity-20" />
                    <p>No exam results available yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Notice Board (Smaller proportion) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col flex-1 min-h-0 overflow-hidden">
              <h3 className="shrink-0 font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Bell size={18} className="text-orange-500" /> School Notices
              </h3>
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
                {notices.length > 0 ? (
                  notices.map((notice, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-xl bg-orange-50/30 border border-orange-100 hover:bg-orange-50 transition-colors">
                      <div className="mt-1 min-w-fit">
                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                           <AlertCircle size={16} />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 text-sm">{notice.title}</h4>
                        <p className="text-sm text-gray-600 mt-1 leading-relaxed line-clamp-2">{notice.content}</p>
                        <p className="text-[10px] text-gray-400 mt-2 font-medium uppercase tracking-wide">
                          {formatDate(notice.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-400 text-sm py-4">No new notices.</p>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (1/3) */}
          <div className="lg:col-span-1 flex flex-col gap-6 h-full min-h-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col flex-1 min-h-0 overflow-hidden">
              <h3 className="shrink-0 font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Clock size={18} className="text-blue-600" /> Today's Schedule
              </h3>
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-0 relative pr-2">
                <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-100"></div>
                {schedule.length > 0 ? (
                  schedule.map((item, i) => (
                    <div key={i} className="relative pl-10 py-3 group">
                      <div className="absolute left-[-1.5px] top-4.5 w-2.5 h-2.5 bg-white border-2 border-blue-400 rounded-full z-10 group-hover:bg-blue-600 transition-colors"></div>
                      <p className="text-xs font-bold text-blue-600 mb-0.5">{item.startTime}</p>
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 group-hover:border-blue-200 group-hover:bg-blue-50/30 transition-all">
                        <p className="font-bold text-gray-800 text-sm">{item.subject}</p>
                        <span className="text-xs text-gray-500">Room: {item.room || 'N/A'}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <CalendarCheck size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No classes scheduled.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Contact */}
            <div className="shrink-0 bg-indigo-900 rounded-xl p-6 text-white text-center shadow-lg">
               <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3 text-indigo-300">
                  <User size={24} />
               </div>
               <h3 className="font-bold mb-1">Contact Teacher</h3>
               <p className="text-xs text-indigo-200 mb-4 px-4">Have questions about {student.name}'s progress?</p>
               <button className="w-full bg-white text-indigo-900 py-2.5 rounded-lg text-sm font-bold hover:bg-indigo-50 transition shadow-sm">
                 Send Message
               </button>
            </div>
          </div>

        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #e2e8f0; border-radius: 10px; }
      `}} />
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
      </div>
      <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="max-w-6xl mx-auto p-6 animate-pulse h-full overflow-hidden flex flex-col">
      <div className="shrink-0 h-40 bg-gray-200 rounded-2xl mb-6"></div>
      <div className="shrink-0 grid grid-cols-4 gap-4 mb-6">
        {[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>)}
      </div>
      <div className="flex-1 grid grid-cols-3 gap-8 min-h-0">
        <div className="col-span-2 h-full bg-gray-200 rounded-xl"></div>
        <div className="h-full bg-gray-200 rounded-xl"></div>
      </div>
    </div>
  );
}