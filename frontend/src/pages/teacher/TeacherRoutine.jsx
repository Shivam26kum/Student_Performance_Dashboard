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
    <div className="h-full flex flex-col max-w-6xl mx-auto overflow-hidden p-4 font-sans">
      
      {/* --- HEADER & DAY SELECTOR --- */}
      <div className="shrink-0 bg-white p-6 rounded-xl shadow-sm mb-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Clock className="text-emerald-600" size={24} /> My Teaching Schedule
        </h2>
        <p className="text-sm font-medium text-gray-500 mt-1">Manage and view your daily class assignments.</p>
        
        <div className="flex gap-2 mt-6 overflow-x-auto pb-2 custom-scrollbar">
          {days.map(day => (
            <button 
              key={day}
              onClick={() => setActiveDay(day)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                activeDay === day 
                  ? "bg-emerald-600 text-white shadow-md" 
                  : "bg-gray-50 text-gray-500 hover:bg-gray-100"
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* --- SCHEDULE LIST --- */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-4">
        {dailyClasses.length > 0 ? (
          <div className="space-y-4">
            {dailyClasses.map((cls, i) => (
              <div key={i} className="bg-white p-5 rounded-xl shadow-sm flex gap-6 hover:bg-emerald-50/30 transition-colors">
                <div className="shrink-0 flex flex-col items-center justify-center min-w-28 bg-gray-50 rounded-xl px-4 py-2">
                  <span className="text-lg font-bold text-emerald-700">{cls.startTime}</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">To {cls.endTime}</span>
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <h3 className="text-lg font-bold text-gray-800 leading-tight">{cls.subject}</h3>
                  <div className="flex flex-wrap gap-4 mt-2">
                    <p className="text-sm font-medium text-gray-500 flex items-center gap-1.5">
                      <Users size={16} className="text-gray-400" /> 
                      Class {cls.classGrade}-{cls.section}
                    </p>
                    <p className="text-sm font-medium text-gray-500 flex items-center gap-1.5">
                      <MapPin size={16} className="text-gray-400" /> 
                      Room {cls.room}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-white rounded-xl shadow-sm py-20">
             <Calendar size={48} className="opacity-20 mb-3" />
             <p className="font-bold text-gray-500 uppercase tracking-wide text-sm">No classes scheduled for {activeDay}</p>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #e2e8f0; border-radius: 10px; }
      `}} />
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="max-w-6xl mx-auto p-4 animate-pulse h-full overflow-hidden flex flex-col gap-4">
      <div className="shrink-0 h-44 bg-gray-200 rounded-xl"></div>
      <div className="flex-1 bg-gray-200 rounded-xl"></div>
    </div>
  );
}