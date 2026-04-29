import { useState, useEffect } from "react";
import { postNotice, getNotices, deleteNotice, updateNotice } from "../../api/adminApi"; 
import { Bell, Send, Users, FileText, Trash2, Clock, Edit3, X, CheckCircle } from "lucide-react";
import { useToaster } from "react-toastella"; 

export default function AdminNotices() {
  const { notify } = useToaster();

  // Safe toast wrapper to prevent React render crashes
  const showToast = (message, type = "success") => {
    setTimeout(() => {
      notify(message, { type });
    }, 0);
  };

  const [loading, setLoading] = useState(false);
  const [allNotices, setAllNotices] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [notice, setNotice] = useState({ title: "", content: "", audience: "all" });

  const fetchNotices = async () => {
    try {
      const { data } = await getNotices();
      setAllNotices(data);
    } catch (err) {
      console.error("Failed to fetch notices");
      showToast("Failed to load existing notices.", "error");
    }
  };

  useEffect(() => { fetchNotices(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        const res = await updateNotice(editingId, notice);
        showToast(res.data?.message || "Notice Updated Successfully!", "success");
      } else {
        const res = await postNotice(notice);
        showToast(res.data?.message || "Notice Posted Successfully!", "success");
      }
      resetForm();
      fetchNotices();
    } catch (err) {
      console.error("Notice Error Details:", err.response?.data || err.message);
      // Once Render updates, this will show the exact MongoDB error!
      showToast(err.response?.data?.message || "Failed to post notice. Check backend.", "error");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNotice({ title: "", content: "", audience: "all" });
    setEditingId(null);
  };

  const handleEdit = (n) => {
    setEditingId(n._id);
    setNotice({ title: n.title, content: n.content, audience: n.audience });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanent delete this notice?")) return;
    try {
      const res = await deleteNotice(id);
      showToast(res.data?.message || "Notice deleted successfully!", "success");
      setAllNotices(allNotices.filter(n => n._id !== id));
    } catch (err) {
      console.error("Delete Error:", err);
      showToast(err.response?.data?.message || "Delete failed.", "error");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-12">
      
      {/* HEADER */}
      <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Notice Management</h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">Post updates or manage existing announcements</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* LEFT: FORM */}
        <div className="lg:col-span-1">
          <div className={`p-5 md:p-6 rounded-xl shadow-sm border transition-all lg:sticky lg:top-6 ${editingId ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-100'}`}>
            <div className="flex justify-between items-center mb-5">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                {editingId ? <Edit3 size={20} className="text-amber-600" /> : <FileText size={20} className="text-indigo-600" />}
                {editingId ? "Edit Notice" : "New Notice"}
                </h3>
                {editingId && (
                    <button type="button" onClick={resetForm} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <X size={18} />
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Title</label>
                <input 
                  type="text" required 
                  className="w-full border border-gray-200 p-3 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow text-sm bg-white"
                  value={notice.title}
                  onChange={(e) => setNotice({...notice, title: e.target.value})}
                  placeholder="Enter notice title"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Audience</label>
                <select 
                  className="w-full border border-gray-200 p-3 rounded-lg outline-none bg-white focus:ring-2 focus:ring-indigo-500 transition-shadow text-sm"
                  value={notice.audience}
                  onChange={(e) => setNotice({...notice, audience: e.target.value})}
                >
                  <option value="all">Everyone</option>
                  <option value="teacher">Teachers Only</option>
                  <option value="parent">Parents Only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Content</label>
                <textarea 
                  required rows="5"
                  className="w-full border border-gray-200 p-3 rounded-lg outline-none resize-none focus:ring-2 focus:ring-indigo-500 transition-shadow text-sm bg-white"
                  value={notice.content}
                  onChange={(e) => setNotice({...notice, content: e.target.value})}
                  placeholder="Type the announcement here..."
                ></textarea>
              </div>

              <button 
                type="submit" disabled={loading}
                className={`w-full text-white py-3 rounded-lg font-semibold transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm text-sm ${editingId ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-200' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'}`}
              >
                {editingId ? <CheckCircle size={18} /> : <Send size={18} />}
                {loading ? "Processing..." : editingId ? "Update Notice" : "Post Notice"}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT: LIST */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Bell size={20} className="text-orange-500" /> History & Status
            </h3>
            <span className="text-xs font-medium text-gray-400">Showing all posted notices</span>
          </div>
          
          <div className="space-y-4 md:space-y-5">
            {allNotices.length > 0 ? (
              allNotices.map((n) => {
                return (
                  <div key={n._id} className="bg-white p-4 md:p-5 rounded-xl border border-indigo-50 shadow-sm transition-all hover:shadow-md group flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    
                    <div className="flex-1 w-full min-w-0">
                      <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-3">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${
                          n.audience === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                        }`}>
                          {n.audience}
                        </span>
                        
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded uppercase tracking-wider">
                            <CheckCircle size={10} /> Live
                        </span>
                        
                        <span className="text-xs font-medium text-gray-400 flex items-center gap-1.5 sm:ml-auto w-full sm:w-auto mt-1 sm:mt-0">
                          <Clock size={12} /> {new Date(n.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <h4 className="font-bold text-gray-800 text-base md:text-lg break-words">{n.title}</h4>
                      <p className="text-gray-600 text-sm mt-2 leading-relaxed whitespace-pre-wrap">{n.content}</p>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto justify-end border-t border-gray-100 sm:border-0 pt-3 sm:pt-0 mt-2 sm:mt-0 shrink-0">
                      <button 
                        type="button"
                        onClick={() => handleEdit(n)}
                        className="flex items-center justify-center gap-1.5 p-2 sm:px-3 sm:py-2 text-sm text-gray-500 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50 rounded-lg transition-colors flex-1 sm:flex-none"
                        title="Edit Notice"
                      >
                        <Edit3 size={16} /> <span className="sm:hidden font-medium">Edit</span>
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleDelete(n._id)}
                        className="flex items-center justify-center gap-1.5 p-2 sm:px-3 sm:py-2 text-sm text-gray-500 hover:text-red-600 bg-gray-50 hover:bg-red-50 rounded-lg transition-colors flex-1 sm:flex-none"
                        title="Delete Permanently"
                      >
                        <Trash2 size={16} /> <span className="sm:hidden font-medium">Delete</span>
                      </button>
                    </div>

                  </div>
                );
              })
            ) : (
              <div className="text-center py-16 md:py-20 bg-white rounded-xl border border-dashed border-gray-200">
                <Bell size={40} className="mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 font-medium">No notices posted yet.</p>
                <p className="text-xs text-gray-400 mt-1">Use the form to create your first announcement.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}