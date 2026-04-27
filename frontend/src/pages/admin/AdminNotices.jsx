import { useState, useEffect } from "react";
import { postNotice, getNotices, deleteNotice, updateNotice } from "../../api/adminApi"; 
import { Bell, Send, Users, FileText, Trash2, Clock, Edit3, X, CheckCircle } from "lucide-react";

export default function AdminNotices() {
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
    }
  };

  useEffect(() => { fetchNotices(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await updateNotice(editingId, notice);
        alert("Notice Updated Successfully!");
      } else {
        await postNotice(notice);
        alert("Notice Posted Successfully!");
      }
      resetForm();
      fetchNotices();
    } catch (err) {
      alert("Operation failed");
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
      await deleteNotice(id);
      setAllNotices(allNotices.filter(n => n._id !== id));
    } catch (err) {
      alert("Delete failed");
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Notice Management</h1>
          <p className="text-gray-500">Post updates or manage existing announcements</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* LEFT: FORM */}
        <div className="lg:col-span-1">
          <div className={`p-6 rounded-xl shadow-sm border transition-all sticky top-6 ${editingId ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-100'}`}>
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                {editingId ? <Edit3 size={20} className="text-amber-600" /> : <FileText size={20} className="text-indigo-600" />}
                {editingId ? "Edit Notice" : "New Notice"}
                </h3>
                {editingId && (
                    <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                        <X size={18} />
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Title</label>
                <input 
                  type="text" required 
                  className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  value={notice.title}
                  onChange={(e) => setNotice({...notice, title: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Audience</label>
                <select 
                  className="w-full border p-3 rounded-lg outline-none bg-white"
                  value={notice.audience}
                  onChange={(e) => setNotice({...notice, audience: e.target.value})}
                >
                  <option value="all">Everyone</option>
                  <option value="teacher">Teachers Only</option>
                  <option value="parent">Parents Only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Content</label>
                <textarea 
                  required rows="5"
                  className="w-full border p-3 rounded-lg outline-none resize-none"
                  value={notice.content}
                  onChange={(e) => setNotice({...notice, content: e.target.value})}
                ></textarea>
              </div>

              <button 
                type="submit" disabled={loading}
                className={`w-full text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${editingId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
              >
                {editingId ? <CheckCircle size={18} /> : <Send size={18} />}
                {loading ? "Processing..." : editingId ? "Update Notice" : "Post Notice"}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT: LIST */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Bell size={20} className="text-orange-500" /> History & Status
            </h3>
            <span className="text-xs text-gray-400">Showing all posted notices</span>
          </div>
          
          <div className="space-y-4">
            {allNotices.length > 0 ? (
              allNotices.map((n) => {
                // REMOVED 'isLive' logic. Every notice is now active/visible.
                return (
                  <div key={n._id} className="bg-white p-5 rounded-xl border border-indigo-100 shadow-sm transition-all group">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            n.audience === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                          }`}>
                            {n.audience}
                          </span>
                          
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase">
                              <CheckCircle size={10} /> Live
                          </span>
                          
                          <span className="text-xs text-gray-400 flex items-center gap-1 ml-auto">
                            <Clock size={12} /> {new Date(n.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="font-bold text-gray-800">{n.title}</h4>
                        <p className="text-gray-600 text-sm mt-2 leading-relaxed">{n.content}</p>
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        <button 
                          onClick={() => handleEdit(n)}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit Notice"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(n._id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Permanently"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
                <Bell size={40} className="mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500">No notices posted yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}