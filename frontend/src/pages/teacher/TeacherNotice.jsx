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
    <div className="h-full flex flex-col font-sans bg-gray-50 overflow-hidden relative">
      
      {/* --- PREMIUM DELETE CONFIRMATION --- */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-4">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">Delete Notice?</h3>
              <p className="text-sm text-gray-500 font-medium mb-8 leading-relaxed">
                This announcement will be permanently removed from the Parent Portal.
              </p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-3.5 rounded-2xl bg-gray-100 text-gray-600 font-bold text-sm hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 py-3.5 rounded-2xl bg-rose-500 text-white font-bold text-sm hover:bg-rose-600 shadow-lg shadow-rose-100 transition-all active:scale-95"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1. HEADER */}
      <div className="shrink-0 bg-white border-b border-gray-100 px-8 py-5 z-10 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <div className="bg-slate-900 p-2 rounded-xl text-white shadow-lg">
                  <Bell size={20} />
              </div>
              Parent Communication
            </h1>
            <p className="text-xs text-gray-500 font-medium mt-1 ml-1">Send important updates directly to parents.</p>
          </div>
          <div className="bg-gray-100 px-4 py-2 rounded-xl flex items-center gap-3 border border-gray-200">
              <Calendar size={14} className="text-gray-400" />
              <p className="text-gray-700 font-black text-[10px] uppercase tracking-tighter">{fullDate}</p>
          </div>
        </div>
      </div>

      {/* 2. MAIN CONTENT */}
      <div className="flex-1 flex overflow-hidden p-6 gap-6">
        
        {/* LEFT: COMPOSE PANEL (Simplified) */}
        <div className="w-85 shrink-0 hidden lg:block h-full">
          <div className="bg-white p-7 rounded-[2.5rem] border border-gray-200 shadow-sm h-fit">
            <div className="flex items-center justify-between mb-8">
                <h3 className="font-black text-gray-900 text-lg tracking-tight">New Notice</h3>
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Megaphone size={18} />
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Heading</label>
                <input 
                  type="text" placeholder="e.g. Holiday Announcement" required
                  className="w-full border border-gray-100 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-slate-500/10 bg-gray-50 font-bold text-xs transition-all"
                  value={newNotice.title}
                  onChange={(e) => setNewNotice({...newNotice, title: e.target.value})}
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Message Details</label>
                <textarea 
                  placeholder="Type the message for parents..." required rows="8"
                  className="w-full border border-gray-100 p-5 rounded-3xl outline-none resize-none bg-gray-50 focus:ring-2 focus:ring-slate-500/10 text-xs leading-relaxed font-medium transition-all"
                  value={newNotice.content}
                  onChange={(e) => setNewNotice({...newNotice, content: e.target.value})}
                ></textarea>
              </div>

              <div className="px-2">
                <p className="text-[10px] text-gray-400 font-bold italic leading-normal">
                  * This notice will be immediately visible on the Parent Dashboard.
                </p>
              </div>

              <button 
                type="submit" disabled={loading}
                className="w-full bg-slate-900 hover:bg-black text-white py-4.5 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl shadow-slate-100"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <><Send size={14} /> Send to Parents</>}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT: FEED */}
        <div className="flex-1 flex flex-col min-w-0 h-full">
          <div className="shrink-0 flex items-center justify-between mb-4 px-2">
            <h3 className="font-black text-gray-400 text-[10px] uppercase tracking-[0.2em]">Broadcast History</h3>
            <span className="bg-indigo-600 text-white text-[9px] font-black px-3 py-1 rounded-full">
              {notices.length} ENTRIES
            </span>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6 pb-10">
            {isFetching ? (
              [1,2,3].map(i => <div key={i} className="h-48 bg-gray-200 animate-pulse rounded-[2.5rem]" />)
            ) : notices.length > 0 ? (
              notices.map((n) => (
                <div key={n._id} className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm relative group transition-all hover:shadow-md hover:border-indigo-100">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm border ${
                        n.authorRole === 'Admin' 
                        ? 'bg-rose-50 text-rose-500 border-rose-100' 
                        : 'bg-indigo-50 text-indigo-500 border-indigo-100'
                      }`}>
                        {n.authorRole === 'Admin' ? <ShieldCheck size={22} /> : <UserCheck size={22} />}
                      </div>
                      
                      <div>
                        <h4 className="text-base font-black text-gray-900 leading-tight">
                          {n.authorName || "Faculty Member"}
                        </h4>
                        
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                            n.authorRole === 'Admin' ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'
                          }`}>
                              {n.authorRole === 'Admin' ? 'Admin' : 'Teacher'}
                          </span>
                          <div className="w-1 h-1 rounded-full bg-gray-200"></div>
                          <span className="text-[9px] text-gray-400 font-bold uppercase flex items-center gap-1">
                              <Clock size={10} /> {new Date(n.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => setDeleteConfirm(n._id)} 
                      className="opacity-0 group-hover:opacity-100 p-2.5 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="pl-1">
                    <h5 className="text-lg font-black text-gray-800 mb-4 group-hover:text-indigo-600 transition-colors">{n.title}</h5>
                    <div className="bg-gray-50/80 p-7 rounded-4xl border border-gray-100 group-hover:bg-white group-hover:border-indigo-50 transition-all">
                        <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                          {n.content}
                        </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-30 py-20">
                <Megaphone size={64} strokeWidth={1} className="mb-4 text-gray-400" />
                <p className="font-black text-xs uppercase tracking-[0.3em] text-gray-500">No History Available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #e2e8f0; border-radius: 10px; }
      `}} />
    </div>
  );
}