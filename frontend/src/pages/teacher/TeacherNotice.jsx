import { useState, useEffect } from "react";
import { getTeacherNotices, postNoticeByTeacher } from "../../api/teacherApi"; 
import api from "../../api/api"; 
import { useToaster } from "react-toastella"; 
import { 
  Bell, Send, Clock, Megaphone, 
  ShieldCheck, Calendar, Trash2, UserCheck,  
  Loader2, AlertTriangle
} from "lucide-react";

export default function TeacherNotices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [newNotice, setNewNotice] = useState({ title: "", content: "", audience: "parent" }); // Defaulting to parent
  const [deleteConfirm, setDeleteConfirm] = useState(null); 
  const { notify } = useToaster();

  const fullDate = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  const fetchNotices = async () => {
    try {
      const { data } = await getTeacherNotices();
      setNotices(data);
    } catch (err) { 
      console.error(err); 
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => { fetchNotices(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Logic: Teachers only send to parents. Admin can see all in their dashboard.
      await postNoticeByTeacher({ ...newNotice, audience: "parent" });
      notify({ message: "Notice sent to parents!", type: "success" });
      setNewNotice({ title: "", content: "", audience: "parent" });
      fetchNotices();
    } catch (err) { 
      notify({ message: "Failed to post notice.", type: "error" }); 
    } finally { 
      setLoading(false); 
    }
  };

  const confirmDelete = async () => {
    if(!deleteConfirm) return;
    try {
      await api.delete(`/api/teacher/notice/${deleteConfirm}`);
      notify({ message: "Notice removed", type: "success" });
      setDeleteConfirm(null);
      fetchNotices();
    } catch (err) { 
      notify({ message: "Delete failed", type: "error" }); 
    }
  };

  return (
    // Fixed: Allowed wrapper to be scrollable on mobile (overflow-y-auto) and locked on desktop (lg:overflow-hidden)
    <div className="h-full flex flex-col font-sans bg-gray-50 overflow-y-auto lg:overflow-hidden relative custom-scrollbar">
      
      {/* --- PREMIUM DELETE CONFIRMATION --- */}
      {deleteConfirm && (
        // Fixed: z-100 to z-[100]
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl sm:rounded-[2.5rem] p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-4 shrink-0">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">Delete Notice?</h3>
              <p className="text-sm text-gray-500 font-medium mb-6 sm:mb-8 leading-relaxed">
                This announcement will be permanently removed from the Parent Portal.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <button 
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-gray-100 text-gray-600 font-bold text-sm hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-rose-500 text-white font-bold text-sm hover:bg-rose-600 shadow-lg shadow-rose-100 transition-all active:scale-95"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1. HEADER */}
      {/* Fixed: Reduced padding for mobile */}
      <div className="shrink-0 bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 z-10 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2 sm:gap-3">
              <div className="bg-slate-900 p-1.5 sm:p-2 rounded-xl text-white shadow-lg shrink-0">
                  <Bell size={20} className="sm:w-5 sm:h-5 w-4 h-4" />
              </div>
              Parent Communication
            </h1>
            <p className="text-xs text-gray-500 font-medium mt-1 ml-1">Send important updates directly to parents.</p>
          </div>
          <div className="bg-gray-100 px-3 sm:px-4 py-2 rounded-xl flex items-center gap-2 sm:gap-3 border border-gray-200 w-fit">
              <Calendar size={14} className="text-gray-400 shrink-0" />
              <p className="text-gray-700 font-black text-[9px] sm:text-[10px] uppercase tracking-tighter">{fullDate}</p>
          </div>
        </div>
      </div>

      {/* 2. MAIN CONTENT */}
      {/* Fixed: Flex-col on mobile, Flex-row on desktop. Padding adjusted. */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-visible lg:overflow-hidden p-4 sm:p-6 lg:p-8 gap-6">
        
        {/* LEFT: COMPOSE PANEL */}
        {/* Fixed: Removed 'hidden lg:block', changed width, added internal scroll on desktop */}
        <div className="w-full lg:w-[360px] shrink-0 h-auto lg:h-full lg:overflow-y-auto custom-scrollbar lg:pr-2">
          <div className="bg-white p-5 sm:p-7 rounded-2xl sm:rounded-[2.5rem] border border-gray-200 shadow-sm h-fit">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
                <h3 className="font-black text-gray-900 text-lg tracking-tight">New Notice</h3>
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                  <Megaphone size={18} />
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Heading</label>
                <input 
                  type="text" placeholder="e.g. Holiday Announcement" required
                  className="w-full border border-gray-100 p-3 sm:p-4 rounded-xl sm:rounded-2xl outline-none focus:ring-2 focus:ring-slate-500/10 bg-gray-50 font-bold text-xs transition-all"
                  value={newNotice.title}
                  onChange={(e) => setNewNotice({...newNotice, title: e.target.value})}
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Message Details</label>
                <textarea 
                  placeholder="Type the message for parents..." required rows="6"
                  className="w-full border border-gray-100 p-4 sm:p-5 rounded-2xl sm:rounded-3xl outline-none resize-none bg-gray-50 focus:ring-2 focus:ring-slate-500/10 text-xs leading-relaxed font-medium transition-all custom-scrollbar"
                  value={newNotice.content}
                  onChange={(e) => setNewNotice({...newNotice, content: e.target.value})}
                ></textarea>
              </div>

              <div className="px-1 sm:px-2">
                <p className="text-[9px] sm:text-[10px] text-gray-400 font-bold italic leading-normal">
                  * This notice will be immediately visible on the Parent Dashboard.
                </p>
              </div>

              <button 
                type="submit" disabled={loading}
                className="w-full bg-slate-900 hover:bg-black text-white py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl shadow-slate-100 disabled:opacity-70"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <><Send size={14} /> Send to Parents</>}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT: FEED */}
        <div className="flex-1 flex flex-col min-w-0 h-auto lg:h-full">
          <div className="shrink-0 flex items-center justify-between mb-4 px-1 sm:px-2">
            <h3 className="font-black text-gray-400 text-[10px] uppercase tracking-[0.2em]">Broadcast History</h3>
            <span className="bg-indigo-600 text-white text-[9px] font-black px-3 py-1 rounded-full">
              {notices.length} ENTRIES
            </span>
          </div>

          <div className="flex-1 lg:overflow-y-auto pr-0 lg:pr-2 custom-scrollbar space-y-4 sm:space-y-6 pb-6 lg:pb-10">
            {isFetching ? (
              [1,2,3].map(i => <div key={i} className="h-48 bg-gray-200 animate-pulse rounded-2xl sm:rounded-[2.5rem]" />)
            ) : notices.length > 0 ? (
              notices.map((n) => (
                <div key={n._id} className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-[3rem] border border-gray-100 shadow-sm relative group transition-all hover:shadow-md hover:border-indigo-100">
                  <div className="flex justify-between items-start mb-4 sm:mb-6">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-sm border shrink-0 ${
                        n.authorRole === 'Admin' 
                        ? 'bg-rose-50 text-rose-500 border-rose-100' 
                        : 'bg-indigo-50 text-indigo-500 border-indigo-100'
                      }`}>
                        {n.authorRole === 'Admin' ? <ShieldCheck size={20} className="sm:w-[22px] sm:h-[22px]" /> : <UserCheck size={20} className="sm:w-[22px] sm:h-[22px]" />}
                      </div>
                      
                      <div className="min-w-0">
                        <h4 className="text-sm sm:text-base font-black text-gray-900 leading-tight truncate">
                          {n.authorName || "Faculty Member"}
                        </h4>
                        
                        <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
                          <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md shrink-0 ${
                            n.authorRole === 'Admin' ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'
                          }`}>
                              {n.authorRole === 'Admin' ? 'Admin' : 'Teacher'}
                          </span>
                          <div className="w-1 h-1 rounded-full bg-gray-200 shrink-0"></div>
                          <span className="text-[8px] sm:text-[9px] text-gray-400 font-bold uppercase flex items-center gap-1 truncate">
                              <Clock size={10} className="shrink-0" /> {new Date(n.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Fixed CRITICAL mobile bug: opacity-100 on mobile, opacity-0 on desktop until hover */}
                    <button 
                      onClick={() => setDeleteConfirm(n._id)} 
                      className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 p-2 sm:p-2.5 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl sm:rounded-2xl transition-all shrink-0 ml-2"
                    >
                      <Trash2 size={18} className="sm:w-5 sm:h-5" />
                    </button>
                  </div>

                  <div className="sm:pl-1">
                    <h5 className="text-base sm:text-lg font-black text-gray-800 mb-3 sm:mb-4 lg:group-hover:text-indigo-600 transition-colors">{n.title}</h5>
                    <div className="bg-gray-50/80 p-4 sm:p-7 rounded-xl sm:rounded-[2rem] border border-gray-100 lg:group-hover:bg-white lg:group-hover:border-indigo-50 transition-all">
                        <p className="text-gray-600 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-medium">
                          {n.content}
                        </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center opacity-30 py-20">
                <Megaphone size={48} strokeWidth={1} className="mb-4 text-gray-400 sm:w-16 sm:h-16" />
                <p className="font-black text-[10px] sm:text-xs uppercase tracking-[0.3em] text-gray-500 text-center">No History Available</p>
              </div>
            )}
          </div>
        </div>
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