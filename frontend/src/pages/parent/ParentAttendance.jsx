import { useState, useEffect } from "react";
import { getParentAttendanceData } from "../../api/parentApi";
import { CalendarCheck, Clock, CalendarDays, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

export default function ParentAttendance() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const { data } = await getParentAttendanceData();
        setAttendanceData(data);
      } catch (err) {
        console.error("Failed to load attendance data:", err);
        setError("Unable to load attendance records at this time.");
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  if (loading) return <AttendanceSkeleton />;

  if (error || !attendanceData) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 py-20 px-4 text-center">
        <AlertCircle size={48} className="mb-4 text-red-300" />
        <p className="font-bold text-gray-700">{error || "No attendance data found."}</p>
        <p className="text-sm mt-1 font-medium">Please check back later or contact the administration.</p>
      </div>
    );
  }

  return (
    // Fixed: Responsive wrapper padding
    <div className="h-full flex flex-col max-w-6xl mx-auto overflow-hidden p-4 sm:p-6 lg:p-8 font-sans">
      
      {/* --- STATIC HEADER --- */}
      {/* Fixed: Adjusted padding for mobile */}
      <div className="shrink-0 bg-white p-4 sm:p-6 rounded-2xl shadow-sm mb-4 sm:mb-6 border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 sm:gap-4 mb-5 sm:mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 tracking-tight">Attendance Record</h2>
            <p className="text-gray-500 font-medium text-xs sm:text-sm mt-1">Track your child's presence and leaves.</p>
          </div>
        </div>

        {/* STATS ROW */}
        {/* Fixed: Adjusted gaps for mobile */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <StatCard label="Overall" value={`${attendanceData.percentage || 0}%`} icon={<CalendarCheck size={18} className="sm:w-5 sm:h-5" />} color="bg-indigo-50 text-indigo-600" />
          <StatCard label="Working Days" value={attendanceData.totalDays || 0} icon={<CalendarDays size={18} className="sm:w-5 sm:h-5" />} color="bg-gray-50 text-gray-600" />
          <StatCard label="Days Present" value={attendanceData.present || 0} icon={<CheckCircle2 size={18} className="sm:w-5 sm:h-5" />} color="bg-emerald-50 text-emerald-600" />
          <StatCard label="Days Absent" value={attendanceData.absent || 0} icon={<XCircle size={18} className="sm:w-5 sm:h-5" />} color="bg-rose-50 text-rose-600" />
        </div>
      </div>

      {/* --- SCROLLABLE HISTORY --- */}
      <div className="flex-1 flex flex-col min-h-0 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden w-full">
        <div className="shrink-0 p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="text-gray-800 flex items-center gap-2 font-bold text-xs sm:text-sm uppercase tracking-wider">
            <Clock size={16} className="text-indigo-600" /> Recent History
          </h3>
        </div>
        
        {/* Fixed: Replaced p-0 with proper overflow container to enable both X and Y scrolling smoothly */}
        <div className="flex-1 overflow-auto custom-scrollbar w-full">
          {attendanceData.history && attendanceData.history.length > 0 ? (
            // Fixed: Added min-width and whitespace-nowrap to prevent column crushing on mobile
            <table className="w-full text-left relative min-w-[500px]">
              <thead className="bg-gray-50/95 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="p-4 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap">Date</th>
                  <th className="p-4 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap">Subject/Class</th>
                  <th className="p-4 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 text-center whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {attendanceData.history.map((record, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-mono text-xs sm:text-sm font-medium text-gray-600 whitespace-nowrap">
                      {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="p-4 font-semibold text-gray-800 text-sm whitespace-nowrap">
                      {record.subject || "General"}
                    </td>
                    <td className="p-4 text-center whitespace-nowrap">
                      <span className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider inline-block ${
                        record.status === 'Present' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12 px-4 text-center">
              <CalendarCheck size={40} className="mb-4 opacity-20" />
              <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-gray-400">No attendance records found</p>
            </div>
          )}
        </div>
      </div>

      {/* Global Custom Scrollbar Styling */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #e2e8f0; border-radius: 10px; }
      `}} />
    </div>
  );
}

// Fixed: Removed shadow-sm and added a border to prevent nested shadows, scaled text for mobile
function StatCard({ label, value, icon, color }) {
  return (
    <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-100 flex items-start sm:items-center justify-between gap-2 hover:border-indigo-100 transition-colors">
      <div className="min-w-0">
        <p className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-wider truncate">{label}</p>
        <p className="text-lg sm:text-2xl font-black text-gray-800 mt-0.5 sm:mt-1 truncate">{value}</p>
      </div>
      <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl shrink-0 ${color}`}>
        {icon}
      </div>
    </div>
  );
}

function AttendanceSkeleton() {
  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 animate-pulse h-full overflow-hidden flex flex-col w-full">
      <div className="shrink-0 h-40 bg-gray-200 rounded-2xl mb-4 sm:mb-6"></div>
      <div className="flex-1 bg-gray-200 rounded-2xl min-h-0"></div>
    </div>
  );
}