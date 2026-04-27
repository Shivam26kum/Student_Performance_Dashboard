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
      <div className="flex flex-col items-center justify-center h-full text-gray-500 py-20">
        <AlertCircle size={48} className="mb-4 text-red-300" />
        <p className="font-bold text-gray-700">{error || "No attendance data found."}</p>
        <p className="text-sm mt-1 font-medium">Please check back later or contact the administration.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col max-w-6xl mx-auto overflow-hidden p-4 font-sans">
      
      {/* --- STATIC HEADER --- */}
      <div className="shrink-0 bg-white p-6 rounded-xl shadow-sm mb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800 tracking-tight">Attendance Record</h2>
            <p className="text-gray-500 font-medium text-sm mt-1">Track your child's presence and leaves.</p>
          </div>
        </div>

        {/* STATS ROW */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Overall Attendance" value={`${attendanceData.percentage || 0}%`} icon={<CalendarCheck size={20} />} color="bg-indigo-50 text-indigo-600" />
          <StatCard label="Total Working Days" value={attendanceData.totalDays || 0} icon={<CalendarDays size={20} />} color="bg-gray-50 text-gray-600" />
          <StatCard label="Days Present" value={attendanceData.present || 0} icon={<CheckCircle2 size={20} />} color="bg-green-50 text-green-600" />
          <StatCard label="Days Absent" value={attendanceData.absent || 0} icon={<XCircle size={20} />} color="bg-red-50 text-red-600" />
        </div>
      </div>

      {/* --- SCROLLABLE HISTORY --- */}
      <div className="flex-1 flex flex-col min-h-0 bg-white rounded-xl shadow-sm overflow-hidden w-full pb-2">
        <div className="shrink-0 p-4 flex justify-between items-center bg-gray-50/50">
          <h3 className="text-gray-800 flex items-center gap-2 font-bold text-sm uppercase">
            <Clock size={16} className="text-indigo-600" /> Recent History
          </h3>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
          {attendanceData.history && attendanceData.history.length > 0 ? (
            <table className="w-full text-left relative">
              <thead className="bg-gray-50/95 backdrop-blur-sm sticky top-0 z-10">
                <tr>
                  <th className="p-4 text-xs font-bold uppercase text-gray-500">Date</th>
                  <th className="p-4 text-xs font-bold uppercase text-gray-500">Subject/Class</th>
                  <th className="p-4 text-xs font-bold uppercase text-gray-500 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.history.map((record, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-mono text-sm text-gray-700">
                      {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="p-4 font-semibold text-gray-700">{record.subject || "General"}</td>
                    <td className="p-4 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                        record.status === 'Present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 py-10">
              <CalendarCheck size={32} className="mb-3 opacity-50" />
              <p className="text-sm font-bold uppercase text-gray-500">No attendance records found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between">
      <div>
        <p className="text-xs text-gray-500 font-bold uppercase">{label}</p>
        <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
      </div>
      <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
    </div>
  );
}

function AttendanceSkeleton() {
  return (
    <div className="max-w-6xl mx-auto p-6 animate-pulse h-full overflow-hidden flex flex-col">
      <div className="shrink-0 h-40 bg-gray-200 rounded-xl mb-6"></div>
      <div className="flex-1 bg-gray-200 rounded-xl min-h-0"></div>
    </div>
  );
}