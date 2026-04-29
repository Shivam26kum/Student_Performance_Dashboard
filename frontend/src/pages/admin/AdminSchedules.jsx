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

  const validateAssignment = () => {
    const start = formData.startTime;
    const end = formData.endTime;

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
    // Fixed container padding for mobile constraints
    <div className="h-full flex flex-col p-4 sm:p-6 md:p-8 font-sans overflow-hidden relative bg-gray-50/50">
      
      {/* DELETE MODAL */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-gray-100 animate-in zoom-in-95">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-4 shrink-0">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">Clear Routine Slot?</h3>
              <p className="text-sm text-gray-500">This action only removes the entry for <strong>{activeDay}</strong>.</p>
              <div className="flex flex-col sm:flex-row gap-3 w-full mt-6 sm:mt-8">
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] md:rounded-[3rem] p-5 sm:p-8 md:p-10 max-w-2xl w-full shadow-2xl max-h-[95vh] overflow-y-auto custom-scrollbar border border-white/20">
            <div className="flex justify-between items-start sm:items-center mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-gray-50">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">Assign Routine Slot</h3>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                   <span className="text-[10px] bg-indigo-600 text-white px-2.5 py-1 rounded-full font-black uppercase tracking-widest flex items-center gap-1.5 w-fit">
                     <Calendar size={12} /> {activeDay}
                   </span>
                   <span className="text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase tracking-widest">Locked Day Enrollment</span>
                </div>
              </div>
              <button onClick={() => setShowCreate(false)} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors shrink-0">
                <X size={18} className="sm:w-5 sm:h-5"/>
              </button>
            </div>
            
            {/* Fixed Grid: Changed grid-cols-2 to grid-cols-1 sm:grid-cols-2 for mobile stacking */}
            <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="col-span-1 sm:col-span-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-1">Assigned Teacher</label>
                <select required className="w-full bg-gray-50 border-none rounded-xl sm:rounded-2xl p-3.5 sm:p-4 text-sm font-bold outline-none ring-1 ring-gray-100 focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                  value={formData.teacher} onChange={(e) => setFormData({...formData, teacher: e.target.value})}>
                  <option value="">Select Faculty Member...</option>
                  {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                </select>
              </div>

              <div className="col-span-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-1">Start Time</label>
                <input required type="time" className="w-full bg-gray-50 border-none rounded-xl sm:rounded-2xl p-3.5 sm:p-4 text-sm font-bold outline-none ring-1 ring-gray-100 focus:ring-2 focus:ring-indigo-500"
                  value={formData.startTime} onChange={(e) => setFormData({...formData, startTime: e.target.value})} />
              </div>

              <div className="col-span-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-1">End Time</label>
                <input required type="time" className="w-full bg-gray-50 border-none rounded-xl sm:rounded-2xl p-3.5 sm:p-4 text-sm font-bold outline-none ring-1 ring-gray-100 focus:ring-2 focus:ring-indigo-500"
                  value={formData.endTime} onChange={(e) => setFormData({...formData, endTime: e.target.value})} />
              </div>

              <div className="col-span-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-1">Target Class</label>
                <select required className="w-full bg-gray-50 border-none rounded-xl sm:rounded-2xl p-3.5 sm:p-4 text-sm font-bold outline-none ring-1 ring-gray-100 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  value={formData.classGrade} onChange={(e) => setFormData({...formData, classGrade: e.target.value})}>
                  <option value="">Choose Class</option>
                  {classes.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                </select>
              </div>

              <div className="col-span-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-1">Subject</label>
                <input required type="text" placeholder="e.g. Mathematics" className="w-full bg-gray-50 border-none rounded-xl sm:rounded-2xl p-3.5 sm:p-4 text-sm font-bold outline-none ring-1 ring-gray-100 focus:ring-2 focus:ring-indigo-500"
                  value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} />
              </div>

              <button disabled={isActionLoading} className="col-span-1 sm:col-span-2 mt-2 bg-slate-900 text-white py-4 sm:py-5 rounded-2xl sm:rounded-4xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2 sm:gap-3 active:scale-95 disabled:opacity-50">
                {isActionLoading ? <Loader2 size={18} className="animate-spin" /> : <><CheckCircle2 size={18}/> Commit to {activeDay}</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* HEADER SECTION */}
      {/* Fixed Header Layout for Mobile */}
      <div className="shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-gray-900 flex items-center gap-2 md:gap-3">
            <div className="bg-indigo-600 p-1.5 md:p-2 rounded-xl text-white shadow-lg shadow-indigo-100 shrink-0">
              <Clock size={20} className="w-4 h-4 md:w-5 md:h-5"/>
            </div>
            Daily Academic Planner
          </h1>
          <p className="text-xs md:text-sm text-gray-500 font-medium mt-1">Configure independent routines for every school day.</p>
        </div>
        <button onClick={openCreateModal} className="w-full sm:w-auto justify-center bg-slate-900 text-white px-6 md:px-8 py-3.5 md:py-4 rounded-xl md:rounded-2xl font-black text-[10px] uppercase tracking-[0.15em] flex items-center gap-2 hover:bg-black transition-all shadow-xl shadow-slate-100 active:scale-95 shrink-0">
          <Plus size={16} /> New Assignment
        </button>
      </div>

      {/* DAY SWITCHER TABS */}
      {/* Fixed: Reduced padding for mobile, added whitespace-nowrap */}
      <div className="shrink-0 flex gap-2 md:gap-3 mb-6 md:mb-8 overflow-x-auto pb-2 no-scrollbar">
        {days.map(day => (
          <button 
            key={day}
            onClick={() => setActiveDay(day)}
            className={`px-5 md:px-10 py-2.5 md:py-3.5 whitespace-nowrap rounded-xl md:rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all border shrink-0 ${
              activeDay === day ? "bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100 scale-105 md:scale-105" : "bg-white text-gray-400 border-gray-100 hover:bg-gray-50"
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* DATA TABLE */}
      {/* Fixed: Added inner wrapper to handle horizontal scrolling of the table on mobile */}
      <div className="flex-1 bg-white rounded-[1.5rem] md:rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto overflow-y-auto custom-scrollbar h-full w-full">
          <table className="w-full text-left relative min-w-[750px]">
            <thead className="sticky top-0 bg-white/95 backdrop-blur-md z-10 border-b border-gray-50">
              <tr>
                <th className="p-4 md:p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Time Interval</th>
                <th className="p-4 md:p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Class Enrollment</th>
                <th className="p-4 md:p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Subject</th>
                <th className="p-4 md:p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Assigned Faculty</th>
                <th className="p-4 md:p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right whitespace-nowrap">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="5" className="p-20 text-center"><Loader2 className="animate-spin inline-block text-indigo-500" size={32} /></td></tr>
              ) : schedules.length > 0 ? (
                schedules.map((slot) => (
                  <tr key={slot._id} className="hover:bg-indigo-50/40 transition-colors group">
                    <td className="p-4 md:p-6 font-black text-gray-700 text-xs md:text-sm italic tracking-tighter whitespace-nowrap">{slot.startTime} - {slot.endTime}</td>
                    <td className="p-4 md:p-6">
                      <span className="bg-white border border-gray-200 text-indigo-600 px-3 py-1.5 rounded-lg font-black text-[10px] shadow-sm uppercase whitespace-nowrap">
                        Class {slot.classGrade}
                      </span>
                    </td>
                    <td className="p-4 md:p-6 font-black text-gray-800 text-sm">{slot.subject}</td>
                    <td className="p-4 md:p-6">
                      <div className="flex items-center gap-2 md:gap-3 min-w-[150px]">
                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-black border border-indigo-100 shadow-sm shrink-0">
                          {slot.teacher?.name?.charAt(0)}
                        </div>
                        <span className="text-xs md:text-sm font-bold text-gray-600 tracking-tight truncate">{slot.teacher?.name}</span>
                      </div>
                    </td>
                    <td className="p-4 md:p-6 text-right">
                      <button onClick={() => setDeleteConfirm(slot._id)} className="p-2.5 md:p-2 text-gray-300 hover:text-rose-500 transition-all transform active:scale-90 hover:bg-rose-50 rounded-lg md:rounded-xl">
                        <Trash2 size={18} className="w-4 h-4 md:w-5 md:h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-20 md:p-32 text-center opacity-30">
                    <Calendar size={48} className="md:w-16 md:h-16 mx-auto mb-4 text-gray-200" />
                    <p className="font-black text-[10px] uppercase tracking-[0.2em] md:tracking-[0.4em] text-gray-400">Schedule Empty for {activeDay}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #e2e8f0; border-radius: 10px; }
        @media (min-width: 768px) {
           .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}