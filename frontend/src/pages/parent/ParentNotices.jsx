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
    <div className="h-full flex flex-col max-w-6xl mx-auto overflow-hidden p-4 font-sans">
      
      {/* --- STATIC HEADER --- */}
      <div className="shrink-0 bg-white p-6 rounded-xl shadow-sm mb-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Bell className="text-orange-500" size={24} /> School Notices
        </h2>
        <p className="text-sm font-medium text-gray-500 mt-1">
          Important announcements and updates from the administration.
        </p>
      </div>

      {/* --- SCROLLABLE CONTENT --- */}
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pb-4">
        {notices.map((notice, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-6 flex gap-4 hover:bg-orange-50/10 transition-colors">
            <div className="shrink-0">
              <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
                <Bell size={24} />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-800 leading-tight">
                {notice.title}
              </h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1.5 mt-1 mb-3">
                <Calendar size={12} className="text-gray-300" /> 
                {new Date(notice.createdAt).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              <p className="text-sm font-medium text-gray-600 leading-relaxed whitespace-pre-line bg-gray-50/50 p-4 rounded-xl">
                {notice.content}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- HELPER COMPONENTS ---

function PageSkeleton() {
  return (
    <div className="max-w-6xl mx-auto p-4 animate-pulse h-full overflow-hidden flex flex-col gap-4">
      <div className="shrink-0 h-32 bg-gray-200 rounded-xl"></div>
      <div className="flex-1 bg-gray-200 rounded-xl min-h-0"></div>
    </div>
  );
}

function EmptyState({ message, icon, isChild = false }) {
  return (
    <div className={`flex flex-col items-center justify-center text-gray-400 py-20 ${
      isChild ? 'h-full bg-white rounded-xl shadow-sm' : 'h-[calc(100vh-10rem)]'
    }`}>
      <div className="mb-4 opacity-50 text-gray-300">{icon}</div>
      <p className="font-bold text-gray-500">{message}</p>
    </div>
  );
}