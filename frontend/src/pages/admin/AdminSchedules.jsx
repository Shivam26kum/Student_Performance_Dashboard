import { useState, useEffect, useCallback } from "react";
import api from "../../api/api";
import { 
  Clock, Plus, Trash2, User, BookOpen, Layers, 
  AlertTriangle, X, Loader2, Calendar, CheckCircle2
} from "lucide-react";
import { useToaster } from "react-toastella";

export default function AdminSchedules() {
  const [schedules, setSchedules] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const { notify } = useToaster();

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const [activeDay, setActiveDay] = useState("Monday");

  const [formData, setFormData] = useState({
    teacher: "", day: "Monday", startTime: "", endTime: "", 
    subject: "", classGrade: "", section: "", room: ""
  });

  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    try {
      // Fetches strictly based on the day selected in the UI tabs
      const { data } = await api.get(`/api/admin/schedules?day=${activeDay}`);
      setSchedules(data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [activeDay]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [tRes, cRes] = await Promise.all([
          api.get("/api/admin/teachers"),
          api.get("/api/admin/classes")
        ]);
        setTeachers(tRes.data);
        setClasses(cRes.data);
      } catch (err) { console.error(err); }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  // --- STRICT VALIDATION LOGIC ---
  const validateAssignment = () => {
    const start = formData.startTime;
    const end = formData.endTime;

    // 1. Teacher Conflict check strictly for ACTIVE DAY
    const teacherConflict = schedules.find(slot => {
      const isSameTeacher = slot.teacher?._id === formData.teacher;
      const isOverlapping = (start < slot.endTime) && (end > slot.startTime);
      return isSameTeacher && isOverlapping;
    });

    if (teacherConflict) {
      notify({ 
        message: `${teacherConflict.teacher.name} is already busy on ${activeDay} at this time!`, 
        type: "error" 
      });
      return false;
    }

    // 2. Class Conflict check strictly for ACTIVE DAY
    const classConflict = schedules.find(slot => {
      const isSameClass = slot.classGrade === formData.classGrade;
      const isOverlapping = (start < slot.endTime) && (end > slot.startTime);
      return isSameClass && isOverlapping;
    });

    if (classConflict) {
      notify({ 
        message: `Class ${formData.classGrade} already has a session on ${activeDay} at this time!`, 
        type: "error" 
      });
      return false;
    }

    return true;
  };

  const openCreateModal = () => {
    // FORCE the day to match the active tab when opening the form
    setFormData({ 
      teacher: "", day: activeDay, startTime: "", endTime: "", 
      subject: "", classGrade: "", section: "", room: "" 
    });
    setShowCreate(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!validateAssignment()) return;

    setIsActionLoading(true);
    try {
      await api.post("/api/admin/schedules", formData);
      notify({ message: `Slot successfully assigned to ${activeDay}!`, type: "success" });
      setShowCreate(false);
      fetchSchedules();
    } catch (err) {
      notify({ message: "Assignment conflict on server!", type: "error" });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsActionLoading(true);
    try {
      await api.delete(`/api/admin/schedules/${deleteConfirm}`);
      notify({ message: "Slot successfully removed", type: "success" });
      setDeleteConfirm(null);
      fetchSchedules();
    } catch (err) { notify({ message: "Delete failed", type: "error" }); }
    finally { setIsActionLoading(false); }
  };

  return (
    <div className="h-full flex flex-col p-8 font-sans overflow-hidden relative bg-gray-50/50">
      
      {/* DELETE MODAL */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl border border-gray-100 animate-in zoom-in-95">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-4">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">Clear Routine Slot?</h3>
              <p className="text-sm text-gray-500">This action only removes the entry for <strong>{activeDay}</strong>.</p>
              <div className="flex gap-3 w-full mt-8">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 rounded-xl bg-gray-100 font-bold text-gray-600 hover:bg-gray-200 transition-colors">Cancel</button>
                <button onClick={handleDelete} className="flex-1 py-3 rounded-xl bg-rose-500 text-white font-bold flex items-center justify-center gap-2 hover:bg-rose-600 shadow-lg shadow-rose-100 transition-all active:scale-95">
                  {isActionLoading ? <Loader2 size={16} className="animate-spin" /> : "Remove"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE SLOT MODAL */}
      {showCreate && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[3rem] p-10 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar border border-white/20">
            <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-50">
              <div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Assign Routine Slot</h3>
                <div className="flex items-center gap-2 mt-2">
                   <span className="text-[10px] bg-indigo-600 text-white px-3 py-1 rounded-full font-black uppercase tracking-widest flex items-center gap-1.5">
                     <Calendar size={12} /> {activeDay}
                   </span>
                   <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Locked Day Enrollment</span>
                </div>
              </div>
              <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleCreate} className="grid grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-1">Assigned Teacher</label>
                <select required className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold outline-none ring-1 ring-gray-100 focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                  value={formData.teacher} onChange={(e) => setFormData({...formData, teacher: e.target.value})}>
                  <option value="">Select Faculty Member...</option>
                  {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                </select>
              </div>

              <div className="col-span-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-1">Start Time</label>
                <input required type="time" className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold outline-none ring-1 ring-gray-100 focus:ring-2 focus:ring-indigo-500"
                  value={formData.startTime} onChange={(e) => setFormData({...formData, startTime: e.target.value})} />
              </div>

              <div className="col-span-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-1">End Time</label>
                <input required type="time" className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold outline-none ring-1 ring-gray-100 focus:ring-2 focus:ring-indigo-500"
                  value={formData.endTime} onChange={(e) => setFormData({...formData, endTime: e.target.value})} />
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-1">Target Class</label>
                <select required className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold outline-none ring-1 ring-gray-100 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  value={formData.classGrade} onChange={(e) => setFormData({...formData, classGrade: e.target.value})}>
                  <option value="">Choose Class</option>
                  {classes.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-1">Subject</label>
                <input required type="text" placeholder="e.g. Mathematics" className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold outline-none ring-1 ring-gray-100 focus:ring-2 focus:ring-indigo-500"
                  value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} />
              </div>

              <button disabled={isActionLoading} className="col-span-2 bg-slate-900 text-white py-5 rounded-4xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50">
                {isActionLoading ? <Loader2 size={18} className="animate-spin" /> : <><CheckCircle2 size={18}/> Commit to {activeDay}</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="shrink-0 flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-100"><Clock size={20}/></div>
            Daily Academic Planner
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Configure independent routines for every school day.</p>
        </div>
        <button onClick={openCreateModal} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.15em] flex items-center gap-3 hover:bg-black transition-all shadow-xl shadow-slate-100 active:scale-95">
          <Plus size={18} /> New Assignment
        </button>
      </div>

      {/* DAY SWITCHER TABS */}
      <div className="shrink-0 flex gap-3 mb-8 overflow-x-auto pb-2 no-scrollbar">
        {days.map(day => (
          <button 
            key={day}
            onClick={() => setActiveDay(day)}
            className={`px-10 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all border ${
              activeDay === day ? "bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100 scale-105" : "bg-white text-gray-400 border-gray-100 hover:bg-gray-50"
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* DATA TABLE */}
      <div className="flex-1 bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-y-auto custom-scrollbar h-full">
          <table className="w-full text-left relative">
            <thead className="sticky top-0 bg-white/95 backdrop-blur-md z-10 border-b border-gray-50">
              <tr>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Time Interval</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Class Enrollment</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Subject</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Assigned Faculty</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="5" className="p-32 text-center"><Loader2 className="animate-spin inline-block text-indigo-500" size={32} /></td></tr>
              ) : schedules.length > 0 ? (
                schedules.map((slot) => (
                  <tr key={slot._id} className="hover:bg-indigo-50/40 transition-colors group">
                    <td className="p-6 font-black text-gray-700 text-sm italic tracking-tighter">{slot.startTime} - {slot.endTime}</td>
                    <td className="p-6">
                      <span className="bg-white border border-gray-200 text-indigo-600 px-3 py-1.5 rounded-lg font-black text-[10px] shadow-sm uppercase">
                        Class {slot.classGrade}
                      </span>
                    </td>
                    <td className="p-6 font-black text-gray-800 text-sm">{slot.subject}</td>
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-black border border-indigo-100 shadow-sm">
                          {slot.teacher?.name?.charAt(0)}
                        </div>
                        <span className="text-sm font-bold text-gray-600 tracking-tight">{slot.teacher?.name}</span>
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <button onClick={() => setDeleteConfirm(slot._id)} className="p-2 text-gray-300 hover:text-rose-500 transition-all transform active:scale-90 hover:bg-rose-50 rounded-xl">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-32 text-center opacity-30">
                    <Calendar size={64} className="mx-auto mb-4 text-gray-200" />
                    <p className="font-black text-[10px] uppercase tracking-[0.4em] text-gray-400">Schedule Empty for {activeDay}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #e2e8f0; border-radius: 10px; }
      `}} />
    </div>
  );
}