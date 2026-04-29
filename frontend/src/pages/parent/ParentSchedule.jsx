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
    // Fixed: Added responsive outer padding
    <div className="h-full flex flex-col max-w-6xl mx-auto overflow-hidden p-4 sm:p-6 lg:p-8 font-sans">
      
      {/* STATIC HEADER */}
      {/* Fixed: Scaled padding and border radius, added border */}
      <div className="shrink-0 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-[1.5rem] shadow-sm border border-gray-100 mb-4 sm:mb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4 sm:mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 tracking-tight flex items-center gap-2 sm:gap-3">
              <Clock className="text-indigo-600 sm:w-7 sm:h-7" size={24} /> Weekly Timetable
            </h2>
            <p className="text-gray-500 font-medium text-xs sm:text-sm mt-1">View your child's daily class schedule.</p>
          </div>
        </div>
        
        {/* Day Tabs */}
        {/* Fixed: Reduced padding on mobile to fit more tabs on screen */}
        <div className="flex gap-2 mt-2 overflow-x-auto custom-scrollbar pb-2">
          {days.map(day => (
            <button 
              key={day}
              onClick={() => setActiveDay(day)}
              className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeDay === day 
                  ? "bg-indigo-600 text-white shadow-md" 
                  : "bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-100"
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-4 pr-1 sm:pr-2">
        {activeClasses.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {activeClasses.map((cls, i) => (
              // Fixed: Stack vertically on mobile, side-by-side on sm screens and up
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3.5 sm:p-4 flex flex-col sm:flex-row gap-3 sm:gap-6 hover:border-indigo-100 hover:shadow-md transition-all">
                
                {/* Fixed: Replaced invalid min-w-25 with valid min-w-[110px], flex row on mobile, col on desktop */}
                <div className="shrink-0 flex sm:flex-col items-center sm:justify-center min-w-[110px] sm:min-w-[130px] bg-gray-50 rounded-xl px-4 py-2 sm:py-3 border border-gray-100 gap-2 sm:gap-0">
                  <span className="text-sm sm:text-lg font-bold text-indigo-600">{cls.startTime}</span>
                  <span className="hidden sm:inline text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">To {cls.endTime}</span>
                  <span className="sm:hidden text-xs font-bold text-gray-400 uppercase tracking-widest">- {cls.endTime}</span>
                </div>
                
                <div className="flex-1 flex flex-col justify-center px-1 sm:px-0">
                  <h3 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
                    <BookOpen size={18} className="text-indigo-400 sm:w-5 sm:h-5" /> {cls.subject}
                  </h3>
                  <p className="text-xs sm:text-sm font-medium text-gray-500 mt-1.5 flex items-center gap-1.5">
                    <MapPin size={14} className="text-gray-400 sm:w-4 sm:h-4" /> Room: {cls.room}
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

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #e2e8f0; border-radius: 10px; }
        @media (min-width: 640px) {
           .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        }
      `}} />
    </div>
  );
}

// --- HELPER COMPONENTS ---

function PageSkeleton() {
  return (
    // Fixed: Matches responsive padding
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 animate-pulse h-full overflow-hidden flex flex-col gap-4 sm:gap-6 w-full">
      <div className="shrink-0 h-36 sm:h-44 bg-gray-200 rounded-2xl w-full"></div>
      <div className="flex-1 bg-gray-200 rounded-2xl w-full min-h-0"></div>
    </div>
  );
}

function EmptyState({ message, icon, isChild = false }) {
  return (
    // Fixed: Ensured text styling scales nicely on mobile
    <div className={`flex flex-col items-center justify-center text-gray-400 py-16 sm:py-20 px-4 text-center w-full ${isChild ? 'h-full bg-white rounded-2xl shadow-sm border border-gray-100' : 'h-[calc(100vh-10rem)]'}`}>
      <div className="mb-4 opacity-30 text-gray-400">{icon}</div>
      <p className="font-bold text-gray-500 uppercase tracking-widest text-xs sm:text-sm">{message}</p>
    </div>
  );
}