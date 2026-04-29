import { useState, useEffect } from "react";
import { getParentNoticesData } from "../../api/parentApi";
import { Bell, Calendar, Inbox } from "lucide-react";

export default function ParentNotices() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const { data } = await getParentNoticesData();
        setNotices(data);
      } catch (err) {
        console.error("Failed to load notices:", err);
        setError("Unable to load notices.");
      } finally {
        setLoading(false);
      }
    };
    fetchNotices();
  }, []);

  if (loading) return <PageSkeleton />;
  if (error || notices.length === 0) {
    return <EmptyState message={error || "No new notices."} icon={<Inbox size={48} />} />;
  }

  return (
    // Fixed: Added responsive padding to the main wrapper
    <div className="h-full flex flex-col max-w-6xl mx-auto overflow-hidden p-4 sm:p-6 lg:p-8 font-sans">
      
      {/* --- STATIC HEADER --- */}
      {/* Fixed: Adjusted padding for mobile and added subtle border */}
      <div className="shrink-0 bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2 sm:gap-3">
          <Bell className="text-orange-500 sm:w-7 sm:h-7" size={24} /> School Notices
        </h2>
        <p className="text-xs sm:text-sm font-medium text-gray-500 mt-1">
          Important announcements and updates from the administration.
        </p>
      </div>

      {/* --- SCROLLABLE CONTENT --- */}
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 sm:space-y-5 pb-4 sm:pr-2">
        {notices.map((notice, i) => (
          // Fixed: Scaled padding, border radius, and added border
          <div key={i} className="bg-white rounded-2xl sm:rounded-[1.5rem] shadow-sm border border-gray-100 p-4 sm:p-6 flex gap-3 sm:gap-5 hover:border-orange-100 transition-colors">
            <div className="shrink-0 mt-0.5 sm:mt-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-50 text-orange-600 rounded-xl sm:rounded-2xl flex items-center justify-center">
                <Bell size={20} className="sm:w-6 sm:h-6" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-gray-800 leading-tight pr-2">
                {notice.title}
              </h3>
              <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1.5 mt-1.5 mb-3 sm:mb-4 tracking-wider">
                <Calendar size={12} className="text-gray-300" /> 
                {new Date(notice.createdAt).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              <p className="text-xs sm:text-sm font-medium text-gray-600 leading-relaxed whitespace-pre-line bg-gray-50/50 border border-gray-50 p-3 sm:p-4 rounded-xl">
                {notice.content}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Global Custom Scrollbar Styling */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #e2e8f0; border-radius: 10px; }
        @media (min-width: 640px) {
          .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        }
      `}} />
    </div>
  );
}

// --- HELPER COMPONENTS ---

function PageSkeleton() {
  return (
    // Fixed: Matches the responsive layout padding
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 animate-pulse h-full overflow-hidden flex flex-col gap-4 sm:gap-6 w-full">
      <div className="shrink-0 h-24 sm:h-32 bg-gray-200 rounded-2xl w-full"></div>
      <div className="flex-1 bg-gray-200 rounded-[1.5rem] min-h-0 w-full"></div>
    </div>
  );
}

function EmptyState({ message, icon, isChild = false }) {
  return (
    // Fixed: Ensure the empty state aligns properly on small screens
    <div className={`flex flex-col items-center justify-center text-gray-400 py-20 px-4 text-center w-full ${
      isChild ? 'h-full bg-white rounded-2xl shadow-sm border border-gray-100' : 'h-[calc(100vh-10rem)]'
    }`}>
      <div className="mb-4 opacity-30 text-gray-400">{icon}</div>
      <p className="font-bold text-gray-500 uppercase tracking-widest text-sm">{message}</p>
    </div>
  );
}