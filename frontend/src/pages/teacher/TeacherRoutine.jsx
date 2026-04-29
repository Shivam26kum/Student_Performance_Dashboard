import { useState, useEffect } from "react";
import api from "../../api/api";
import { Clock, MapPin, Users, Calendar } from "lucide-react";

export default function TeacherRoutine() {
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState(null);
  
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const currentDay = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
  const [activeDay, setActiveDay] = useState(days.includes(currentDay) ? currentDay : "Monday");

  useEffect(() => {
    const fetchRoutine = async () => {
      try {
        const { data } = await api.get("/api/teacher/my-schedule");
        setSchedule(data);
      } catch (err) {
        console.error("Failed to load routine");
      } finally {
        setLoading(false);
      }
    };
    fetchRoutine();
  }, []);

  if (loading) return <PageSkeleton />;

  const dailyClasses = schedule?.[activeDay] || [];

  return (
    // Fixed: Added responsive outer padding
    <div className="h-full flex flex-col max-w-6xl mx-auto overflow-hidden p-4 sm:p-6 lg:p-8 font-sans">
      
      {/* --- HEADER & DAY SELECTOR --- */}
      {/* Fixed: Scaled padding, border radius, and added border */}
      <div className="shrink-0 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-[1.5rem] shadow-sm border border-gray-100 mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2 sm:gap-3">
          <Clock className="text-emerald-600 sm:w-7 sm:h-7" size={24} /> My Teaching Schedule
        </h2>
        <p className="text-xs sm:text-sm font-medium text-gray-500 mt-1">Manage and view your daily class assignments.</p>
        
        {/* Fixed: Reduced padding on mobile to fit more tabs on screen */}
        <div className="flex gap-2 mt-4 sm:mt-6 overflow-x-auto pb-2 custom-scrollbar">
          {days.map(day => (
            <button 
              key={day}
              onClick={() => setActiveDay(day)}
              className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeDay === day 
                  ? "bg-emerald-600 text-white shadow-md" 
                  : "bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-100"
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* --- SCHEDULE LIST --- */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-4 pr-1 sm:pr-2">
        {dailyClasses.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {dailyClasses.map((cls, i) => (
              // Fixed: Stack vertically on mobile, side-by-side on sm screens and up
              <div key={i} className="bg-white p-3.5 sm:p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-3 sm:gap-6 hover:bg-emerald-50/30 hover:border-emerald-100 transition-all">
                
                {/* Fixed: Replaced invalid min-w-28 with valid min-w-[110px], flex row on mobile, col on desktop */}
                <div className="shrink-0 flex sm:flex-col items-center sm:justify-center min-w-[110px] sm:min-w-[130px] bg-gray-50 rounded-xl px-4 py-2 sm:py-3 border border-gray-100 gap-2 sm:gap-0">
                  <span className="text-sm sm:text-lg font-bold text-emerald-700">{cls.startTime}</span>
                  <span className="hidden sm:inline text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">To {cls.endTime}</span>
                  <span className="sm:hidden text-xs font-bold text-gray-400 uppercase tracking-widest">- {cls.endTime}</span>
                </div>
                
                <div className="flex-1 flex flex-col justify-center px-1 sm:px-0">
                  <h3 className="text-base sm:text-lg font-bold text-gray-800 leading-tight">{cls.subject}</h3>
                  <div className="flex flex-wrap gap-3 sm:gap-4 mt-2">
                    <p className="text-xs sm:text-sm font-medium text-gray-500 flex items-center gap-1.5">
                      <Users className="text-gray-400 sm:w-4 sm:h-4 w-3.5 h-3.5" size={16} /> 
                      Class {cls.classGrade}-{cls.section}
                    </p>
                    <p className="text-xs sm:text-sm font-medium text-gray-500 flex items-center gap-1.5">
                      <MapPin className="text-gray-400 sm:w-4 sm:h-4 w-3.5 h-3.5" size={16} /> 
                      Room {cls.room}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Fixed: Empty state text scaling
          <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-white rounded-2xl shadow-sm border border-gray-100 py-16 sm:py-20 px-4 text-center">
             <Calendar className="opacity-20 mb-3 sm:mb-4 sm:w-12 sm:h-12" size={40} />
             <p className="font-bold text-gray-500 uppercase tracking-widest text-xs sm:text-sm">No classes scheduled for {activeDay}</p>
          </div>
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

function PageSkeleton() {
  return (
    // Fixed: Matches responsive padding
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 animate-pulse h-full overflow-hidden flex flex-col gap-4 sm:gap-6 w-full">
      <div className="shrink-0 h-36 sm:h-44 bg-gray-200 rounded-2xl w-full"></div>
      <div className="flex-1 bg-gray-200 rounded-2xl w-full min-h-0"></div>
    </div>
  );
}