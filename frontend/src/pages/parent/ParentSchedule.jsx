import { useState, useEffect } from "react";
import { getParentScheduleData } from "../../api/parentApi";
import { Clock, MapPin, BookOpen, Calendar } from "lucide-react";

export default function ParentSchedule() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scheduleData, setScheduleData] = useState(null);
  
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const currentDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const [activeDay, setActiveDay] = useState(days.includes(currentDayName) ? currentDayName : "Monday");

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const { data } = await getParentScheduleData();
        setScheduleData(data);
      } catch (err) {
        setError("Unable to load timetable.");
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, []);

  if (loading) return <PageSkeleton />;
  if (error || !scheduleData) return <EmptyState message={error || "No schedule found."} icon={<Clock size={48} />} />;

  const activeClasses = scheduleData[activeDay] || [];

  return (
    <div className="h-full flex flex-col max-w-6xl mx-auto overflow-hidden p-4 font-sans">
      
      {/* STATIC HEADER */}
      <div className="shrink-0 bg-white p-6 rounded-xl shadow-sm mb-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
              <Clock className="text-indigo-600" size={24} /> Weekly Timetable
            </h2>
            <p className="text-gray-500 font-medium text-sm mt-1">View your child's daily class schedule.</p>
          </div>
        </div>
        
        {/* Day Tabs */}
        <div className="flex gap-2 mt-2 overflow-x-auto custom-scrollbar pb-2">
          {days.map(day => (
            <button 
              key={day}
              onClick={() => setActiveDay(day)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                activeDay === day 
                  ? "bg-indigo-600 text-white shadow-md" 
                  : "bg-gray-50 text-gray-500 hover:bg-gray-100"
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-4">
        {activeClasses.length > 0 ? (
          <div className="space-y-4">
            {activeClasses.map((cls, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-4 flex gap-6 hover:bg-indigo-50/30 transition-colors">
                <div className="shrink-0 flex flex-col items-center justify-center min-w-25 bg-gray-50 rounded-xl px-4 py-2">
                  <span className="text-lg font-bold text-indigo-600">{cls.startTime}</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">To {cls.endTime}</span>
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <BookOpen size={18} className="text-gray-400" /> {cls.subject}
                  </h3>
                  <p className="text-sm font-medium text-gray-500 mt-1 flex items-center gap-1.5">
                    <MapPin size={14} className="text-gray-400" /> Room: {cls.room}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState 
            message={`No classes scheduled for ${activeDay}.`} 
            icon={<Calendar size={48} />} 
            isChild 
          />
        )}
      </div>
    </div>
  );
}

// --- HELPER COMPONENTS ---

function PageSkeleton() {
  return (
    <div className="max-w-6xl mx-auto p-4 animate-pulse h-full overflow-hidden flex flex-col gap-4">
      <div className="shrink-0 h-44 bg-gray-200 rounded-xl"></div>
      <div className="flex-1 bg-gray-200 rounded-xl min-h-0"></div>
    </div>
  );
}

function EmptyState({ message, icon, isChild = false }) {
  return (
    <div className={`flex flex-col items-center justify-center text-gray-400 py-20 ${isChild ? 'h-full bg-white rounded-xl shadow-sm' : 'h-[calc(100vh-10rem)]'}`}>
      <div className="mb-4 opacity-50 text-gray-300">{icon}</div>
      <p className="font-bold text-gray-500">{message}</p>
    </div>
  );
}