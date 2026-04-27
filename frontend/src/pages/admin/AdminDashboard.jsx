import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminStats } from "../../api/adminApi";
import {
  Users,
  GraduationCap,
  Layers,
  TrendingUp,
  IndianRupee,
  UserPlus,
  Bell,
  Calendar,
  Printer,
  AlertCircle
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function AdminDashboard() {
  const { name } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    classes: 0,
    teachers: 0,
    students: 0,
    monthlyAttendancePercent: 0,
    // 👇 Ensure this structure matches your backend
    todayAttendance: {
      present: 0,
      absent: 0,
      total: 0,
      percent: 0
    },
    financials: { collected: 0, pending: 0 },
    recentStudents: [],
    recentTeachers: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getAdminStats();
        setStats((prev) => ({ ...prev, ...res.data }));
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard statistics");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <DashboardSkeleton />;

  // --- ⚡️ FIX: Use Real Counts, Don't Calculate from % ---
  const todayStats = stats.todayAttendance || { present: 0, absent: 0, total: 0 };
  
  // 1. Real Present Count
  const presentCount = todayStats.present;
  
  // 2. "Unmarked" students (Total Students - Marked Students)
  const unmarkedCount = stats.students - todayStats.total;
  
  // 3. Real Absent (Marked Absent + Unmarked)
  // This treats anyone NOT marked present as "Absent/Blank" as you requested
  const absentCount = todayStats.absent + unmarkedCount;

  // 4. Calculate Display Percentage (Present vs Total Students)
  const displayPercent = stats.students > 0 
    ? Math.round((presentCount / stats.students) * 100) 
    : 0;

  return (
    <div className="max-w-7xl mx-auto">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome back, {name}
          </h1>
          <p className="text-gray-500 mt-1">
            {today} • Overview of School Performance
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition flex items-center gap-2 shadow-sm print:hidden"
        >
          <Printer size={18} /> Generate Report
        </button>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-6 border border-red-200">
          {error}
        </div>
      )}

      {/* --- STATS OVERVIEW --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 print:grid-cols-4">
        <StatCard
          title="Total Students"
          value={stats.students}
          icon={<GraduationCap size={24} />}
          color="bg-blue-50 text-blue-600"
          trend="Active"
        />
        <StatCard
          title="Total Teachers"
          value={stats.teachers}
          icon={<Users size={24} />}
          color="bg-emerald-50 text-emerald-600"
          trend="Faculty"
        />
        <StatCard
          title="Fee Collection"
          value={
            stats.financials.collected > 1000
              ? `₹${(stats.financials.collected / 1000).toFixed(1)}k`
              : `₹${stats.financials.collected}`
          }
          icon={<IndianRupee size={24} />}
          color="bg-amber-50 text-amber-600"
          trend="Revenue"
        />
        <StatCard
          title="Avg. Attendance"
          value={`${stats.monthlyAttendancePercent || 0}%`}
          icon={<TrendingUp size={24} />}
          color="bg-purple-50 text-purple-600"
          trend="This Month"
        />
      </div>

      {/* --- MAIN GRID --- */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN (2/3) */}
        <div className="lg:col-span-2 space-y-8">
          {/* 1. Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 print:hidden">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Layers size={18} className="text-indigo-600" /> Administrative
              Actions
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <QuickAction
                onClick={() => navigate("/admin/students")}
                icon={<UserPlus size={20} />}
                label="Add Student"
                color="bg-blue-50 text-blue-600"
              />
              <QuickAction
                onClick={() => navigate("/admin/teachers")}
                icon={<Users size={20} />}
                label="Add Teacher"
                color="bg-emerald-50 text-emerald-600"
              />
              <QuickAction
                onClick={() => navigate("/admin/notices")}
                icon={<Bell size={20} />}
                label="Post Notice"
                color="bg-orange-50 text-orange-600"
              />
              <QuickAction
                onClick={() => navigate("/admin/classes")}
                icon={<Calendar size={20} />}
                label="Manage Classes"
                color="bg-purple-50 text-purple-600"
              />
            </div>
          </div>

          {/* 2. Recent Registrations */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800">New Registrations</h3>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {stats.recentTeachers.length + stats.recentStudents.length} New
              </span>
            </div>

            <div className="space-y-3 overflow-y-auto pr-2 flex-1 custom-scrollbar">
              {[...stats.recentTeachers].map((t, i) => (
                <div
                  key={`t-${i}`}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition border border-transparent hover:border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold shrink-0">
                      {t.name?.charAt(0) || "T"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {t.name}
                      </p>
                      <p className="text-xs text-gray-500">{t.email}</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium bg-emerald-50 text-emerald-700 px-2 py-1 rounded">
                    Teacher
                  </span>
                </div>
              ))}

              {[...stats.recentStudents].map((s, i) => (
                <div
                  key={`s-${i}`}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition border border-transparent hover:border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
                      {s.name?.charAt(0) || "S"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {s.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Class {s.class}-{s.section}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded">
                    Student
                  </span>
                </div>
              ))}

              {stats.recentTeachers.length === 0 &&
                stats.recentStudents.length === 0 && (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-gray-400 text-sm">
                      No recent activity found.
                    </p>
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (1/3) */}
        <div className="lg:col-span-1 space-y-8">
          {/* Financial Summary */}
          <div className="bg-linear-to-br from-indigo-900 to-indigo-800 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10"></div>

            <h3 className="text-indigo-100 font-medium mb-1">
              Total Fees Collected
            </h3>
            <div className="text-3xl font-bold mb-6">
              ₹{stats.financials.collected.toLocaleString()}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm text-indigo-200">
                <span>Pending Fees</span>
                <span>₹{stats.financials.pending.toLocaleString()}</span>
              </div>

              <div className="w-full bg-indigo-950 rounded-full h-2">
                <div
                  className="bg-emerald-400 h-2 rounded-full transition-all duration-1000"
                  style={{
                    width: `${
                      stats.financials.collected + stats.financials.pending > 0
                        ? (stats.financials.collected /
                            (stats.financials.collected +
                              stats.financials.pending)) *
                          100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Attendance Breakdown (UPDATED CHART) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-start mb-5">
              <h3 className="font-bold text-gray-800">Today's Attendance</h3>
              {unmarkedCount > 0 && (
                <div className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full border border-orange-100">
                  <AlertCircle size={12} />
                  <span>{unmarkedCount} Unmarked</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center py-2">
              {/* Uses Display Percentage (Present / Total Students) */}
              <AttendanceChart percentage={displayPercent} />
            </div>

            <div className="flex justify-between text-sm text-gray-600 mt-6 px-2 bg-gray-50 py-3 rounded-lg border border-gray-100">
              <div className="text-center">
                <p className="font-bold text-gray-800 text-lg">
                  {stats.students}
                </p>
                <p className="text-xs text-gray-500 uppercase font-medium">
                  Total
                </p>
              </div>
              <div className="w-px bg-gray-300"></div>
              <div className="text-center">
                <p className="font-bold text-emerald-600 text-lg">
                  {presentCount}
                </p>
                <p className="text-xs text-gray-500 uppercase font-medium">
                  Present
                </p>
              </div>
              <div className="w-px bg-gray-300"></div>
              <div className="text-center">
                {/* Absent now includes Unmarked + Marked Absent */}
                <p className="font-bold text-red-500 text-lg">{absentCount}</p>
                <p className="text-xs text-gray-500 uppercase font-medium">
                  Absent
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ... Helper Components ...
function AttendanceChart({ percentage }) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  // Safety check for NaN or Infinity
  const safePercent = isNaN(percentage) ? 0 : percentage;
  const strokeDashoffset = circumference - (safePercent / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg width="160" height="160" className="transform -rotate-90">
        <circle cx="80" cy="80" r={radius} stroke="#F3F4F6" strokeWidth="12" fill="transparent" />
        <circle
          cx="80" cy="80" r={radius}
          stroke="#4F46E5" strokeWidth="12"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold text-gray-800">{safePercent}%</span>
        <span className="text-xs text-gray-500 font-medium">Present</span>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, trend }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
      </div>
      <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-full">
        <TrendingUp size={12} /> {trend}
      </div>
    </div>
  );
}

function QuickAction({ onClick, icon, label, color }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 hover:border-indigo-100 hover:shadow-md transition-all group bg-gray-50 hover:bg-white"
    >
      <div className={`p-3 rounded-full mb-3 group-hover:scale-110 transition-transform ${color}`}>
        {icon}
      </div>
      <span className="text-sm font-semibold text-gray-700 group-hover:text-indigo-600">
        {label}
      </span>
    </button>
  );
}

function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto p-6 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
      <div className="grid grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>)}
      </div>
      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 h-96 bg-gray-200 rounded-xl"></div>
        <div className="col-span-1 h-96 bg-gray-200 rounded-xl"></div>
      </div>
    </div>
  );
}
