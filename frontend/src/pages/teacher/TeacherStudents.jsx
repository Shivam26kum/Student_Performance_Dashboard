import { useEffect, useState } from "react";
import api from "../../api/api";
import emailjs from "@emailjs/browser";
import { addStudent, addParent, updateParent } from "../../api/teacherApi";
import { useToaster } from "react-toastella";
import {
  Plus, UserPlus, Eye, EyeOff, X, Layers, Mail,
  User as UserIcon, Lock, Loader2, Filter, Edit2,
  Save, Calendar, Phone, Trash2, AlertCircle,
} from "lucide-react";

// --- CENTRALIZED ACADEMIC CONFIGURATION ---
const ACADEMIC_YEARS = [
  { label: "2025-26", start: "2025-04-01", end: "2026-03-31" },
  { label: "2026-27", start: "2026-04-01", end: "2027-03-31" },
];

export default function TeacherStudents() {
  const { notify } = useToaster();

  // --- CORE DATA STATES ---
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [attendanceFilter, setAttendanceFilter] = useState("all");

  // --- PERSISTENCE & SESSION CONTEXT ---
  const [selectedClassId] = useState(() => {
    const savedId = localStorage.getItem("teacher_dashboard_class_id");
    const savedTime = localStorage.getItem("teacher_dashboard_class_timestamp");
    if (savedId && savedTime && Date.now() - parseInt(savedTime) < 3600000) return savedId;
    return "";
  });

  const [academicYear] = useState(() => {
    const now = new Date();
    const currentSession = ACADEMIC_YEARS.find(year => {
      const start = new Date(year.start);
      const end = new Date(year.end);
      return now >= start && now <= end;
    });
    const latestValidSession = currentSession?.label || ACADEMIC_YEARS[ACADEMIC_YEARS.length - 1].label;
    const saved = localStorage.getItem("academic_year_label");
    return saved || latestValidSession;
  });

  // --- MODAL VISIBILITY STATES ---
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showAddParentModal, setShowAddParentModal] = useState(false);
  const [showViewParentModal, setShowViewParentModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // --- SELECTION & EDITING STATES ---
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [selectedParent, setSelectedParent] = useState(null);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [isEditingParent, setIsEditingParent] = useState(false);

  // --- FORM STATES ---
  const [studentForm, setStudentForm] = useState({ name: "", rollNo: "", class: "", section: "" });
  const [parentForm, setParentForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [editParentForm, setEditParentForm] = useState({ 
    name: "", email: "", phone: "", password: "" 
  });

  const fetchStudents = async () => {
    if (!selectedClassId) return;
    setLoading(true);
    try {
      const parts = selectedClassId.split("-");
      const yearData = ACADEMIC_YEARS.find(y => y.label === academicYear) || ACADEMIC_YEARS[0];
      const query = `?classGrade=${parts[0]}&section=${parts[1]}&subject=${encodeURIComponent(parts.slice(2).join("-"))}&startDate=${yearData.start}&endDate=${yearData.end}`;
      const { data } = await api.get(`/api/teacher/class-students${query}`);
      setStudents(data.sort((a, b) => 
        a.rollNo.toString().localeCompare(b.rollNo.toString(), undefined, { numeric: true })
      ));
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStudents(); }, [selectedClassId, academicYear]);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      await addStudent(studentForm);
      setShowStudentModal(false);
      setStudentForm({ name: "", rollNo: "", class: "", section: "" });
      fetchStudents();
      notify({ message: "Student added successfully!", type: "success" });
    } catch (err) {
      notify({ message: "Failed to add student.", type: "error" });
    }
  };

  const confirmDelete = async () => {
    if (!studentToDelete) return;
    setLoading(true);
    try {
      await api.delete(`/api/teacher/student/${studentToDelete.id}`);
      notify({ message: "Student record removed.", type: "success" });
      setShowDeleteModal(false);
      setStudentToDelete(null);
      fetchStudents();
    } catch (err) {
      notify({ message: "Deletion failed.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleAddParent = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addParent({ ...parentForm, studentId: selectedStudentId });
      const params = {
        parent_name: parentForm.name,
        parent_email: parentForm.email,
        phone: parentForm.phone,
        password: parentForm.password,
        academic_year: academicYear,
        to_email: parentForm.email,
      };
      await emailjs.send("parent", "parentIdPassword", params, "ABrQoZhArjY5YNK8P");
      fetchStudents();
      setShowAddParentModal(false);
      setParentForm({ name: "", email: "", password: "", phone: "" });
      notify({ message: "Parent access granted!", type: "success" });
    } catch (err) {
      notify({ message: "Error setting up access.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateParent = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateParent(selectedParent._id, editParentForm);
      const params = {
        parent_name: editParentForm.name,
        parent_email: editParentForm.email,
        phone: editParentForm.phone,
        password: editParentForm.password || "Unchanged",
        academic_year: academicYear,
        to_email: editParentForm.email,
      };
      await emailjs.send("parent", "parentIdPassword", params, "ABrQoZhArjY5YNK8P");
      notify({ message: "Profile updated successfully!", type: "success" });
      setIsEditingParent(false);
      setShowViewParentModal(false);
      fetchStudents();
    } catch (err) {
      notify({ message: "Update failed.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const openViewParent = (data) => {
    setSelectedParent(data);
    setEditParentForm({ 
      name: data.name || "", 
      email: data.email || "", 
      phone: data.phone || "", 
      password: "" 
    });
    setIsEditingParent(false);
    setShowViewParentModal(true);
  };

  const filteredStudents = students.filter((s) => {
    const p = parseFloat(s.attendancePercentage) || 0;
    if (attendanceFilter === "above75") return p >= 75;
    if (attendanceFilter === "below75") return p < 75;
    return true;
  });

  const getHeaderInfo = () => {
    if (!selectedClassId) return "Not Selected";
    const p = selectedClassId.split("-");
    return `${p[0]}-${p[1]} (${p.slice(2).join("-")})`;
  };

  return (
    // Fixed: Responsive wrapper padding
    <div className="flex flex-col h-full md:h-[calc(100vh-3rem)] max-w-6xl mx-auto w-full p-4 sm:p-6 lg:p-8 pb-2 font-sans text-slate-900">
      
      {/* --- PAGE HEADER --- */}
      <header className="shrink-0 flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800">Student Directory</h2>
          <div className="flex flex-wrap items-center gap-2 mt-1.5 sm:mt-2">
            <span className="bg-indigo-50 text-indigo-600 text-[9px] sm:text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 uppercase tracking-wider">
              <Calendar size={12} /> Session {academicYear}
            </span>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <p className="text-slate-500 text-[10px] sm:text-xs font-medium uppercase tracking-wide">
              Subject: <span className="text-slate-800 font-bold">{getHeaderInfo()}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <select 
              className="pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500 w-full appearance-none cursor-pointer shadow-sm transition-all"
              value={attendanceFilter} 
              onChange={(e) => setAttendanceFilter(e.target.value)}
            >
              <option value="all">All Attendance</option>
              <option value="above75">Above 75%</option>
              <option value="below75">Below 75%</option>
            </select>
          </div>
          <button 
            onClick={() => setShowStudentModal(true)} 
            disabled={!selectedClassId}
            className="px-4 sm:px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 font-bold shadow-sm bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 transition-all active:scale-95 text-xs sm:text-sm"
          >
            <Plus size={18} /> <span className="hidden sm:inline">Add Student</span>
          </button>
        </div>
      </header>

      {/* --- DATA TABLE / EMPTY STATE --- */}
      {!selectedClassId ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-[2rem] sm:rounded-4xl border-2 border-dashed border-slate-100 p-8 text-center">
          <Layers size={40} className="text-slate-200 mb-4 opacity-50 sm:w-12 sm:h-12" />
          <h3 className="text-slate-400 font-bold uppercase tracking-widest text-[10px] sm:text-xs">Class Selection Required</h3>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0 bg-white rounded-2xl sm:rounded-4xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Fixed: Added overflow-x-auto and min-width to prevent table crushing on mobile */}
          <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar w-full">
            <table className="w-full text-left relative min-w-[650px]">
              <thead className="bg-slate-50/95 backdrop-blur-sm border-b border-slate-100 sticky top-0 z-10">
                <tr>
                  <th className="p-4 sm:p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Roll</th>
                  <th className="p-4 sm:p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Full Name</th>
                  <th className="p-4 sm:p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center whitespace-nowrap">Status</th>
                  <th className="p-4 sm:p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan="4" className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-indigo-500" size={24} /></td></tr>
                ) : filteredStudents.length > 0 ? (
                  filteredStudents.map((s) => (
                    <tr key={s._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="p-4 sm:p-5 font-mono text-xs sm:text-sm text-slate-400 font-bold whitespace-nowrap">{s.rollNo}</td>
                      <td className="p-4 sm:p-5 font-bold text-sm text-slate-700 whitespace-nowrap">{s.name}</td>
                      <td className="p-4 sm:p-5 text-center whitespace-nowrap">
                        <span className={`text-[9px] sm:text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider inline-block ${parseFloat(s.attendancePercentage) < 75 ? "bg-rose-50 text-rose-600 border border-rose-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"}`}>
                          {s.attendancePercentage ? `${s.attendancePercentage}%` : "No Record"}
                        </span>
                      </td>
                      <td className="p-4 sm:p-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                          {s.parent ? (
                            <button onClick={() => openViewParent(s.parent)} className="text-indigo-600 hover:bg-indigo-50 px-2 sm:px-3 py-1.5 rounded-lg font-bold text-[10px] sm:text-xs flex items-center gap-1.5 transition-all shrink-0">
                              <Eye size={14} className="sm:w-4 sm:h-4" /> <span className="hidden sm:inline">View Parent</span>
                            </button>
                          ) : (
                            <button onClick={() => { setSelectedStudentId(s._id); setShowAddParentModal(true); }} className="text-emerald-600 hover:bg-emerald-50 px-2 sm:px-3 py-1.5 rounded-lg font-bold text-[10px] sm:text-xs flex items-center gap-1.5 transition-all shrink-0">
                              <UserPlus size={14} className="sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Add Parent</span>
                            </button>
                          )}
                          <button onClick={() => { setStudentToDelete({ id: s._id, name: s.name }); setShowDeleteModal(true); }} className="text-slate-300 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-lg transition-all shrink-0">
                            <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-16 text-center text-slate-400 font-bold text-sm">
                      No students match the current filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- MODAL: DELETE CONFIRMATION --- */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 max-w-sm w-full shadow-2xl text-center animate-in zoom-in-95">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-5 sm:mb-6 border-[6px] border-white shadow-sm">
              <AlertCircle size={32} className="sm:w-10 sm:h-10" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-800">Delete Record?</h3>
            <p className="text-slate-500 text-xs sm:text-sm mt-3 leading-relaxed">
              Are you sure you want to remove <strong>{studentToDelete?.name}</strong>? This will permanently erase their data.
            </p>
            <div className="flex flex-col gap-3 mt-8 sm:mt-10">
              <button onClick={confirmDelete} className="w-full bg-rose-600 text-white py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-black shadow-lg shadow-rose-100 hover:bg-rose-700 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm">
                {loading ? <Loader2 className="animate-spin" size={18} /> : "Yes, Delete student"}
              </button>
              <button onClick={() => { setShowDeleteModal(false); setStudentToDelete(null); }} className="w-full bg-slate-100 text-slate-600 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold hover:bg-slate-200 transition-all text-xs sm:text-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: ENROLL STUDENT --- */}
      {showStudentModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-4xl w-full max-w-md shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg sm:text-xl font-black text-slate-800 uppercase tracking-tighter">Enroll Student</h3>
              <button onClick={() => setShowStudentModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20}/></button>
            </div>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <input type="text" placeholder="e.g. John Doe" className="w-full bg-slate-50 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-transparent focus:border-indigo-200 outline-none transition-all text-sm font-semibold" required value={studentForm.name} onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Roll Number</label>
                <input type="text" placeholder="e.g. 101" className="w-full bg-slate-50 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-transparent focus:border-indigo-200 outline-none transition-all text-sm font-semibold" required value={studentForm.rollNo} onChange={(e) => setStudentForm({ ...studentForm, rollNo: e.target.value })} />
              </div>
              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
                <button type="button" onClick={() => setShowStudentModal(false)} className="flex-1 font-bold text-slate-400 py-3 text-sm">Cancel</button>
                <button type="submit" className="flex-1 bg-emerald-600 text-white py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black shadow-lg hover:bg-emerald-700 transition-all active:scale-95 text-sm uppercase tracking-wider">Save Record</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: PARENT ACCESS --- */}
      {showAddParentModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-4xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar animate-in zoom-in-95">
            <h3 className="text-lg sm:text-xl font-black text-slate-800 mb-6 uppercase tracking-tighter">Parent Portal Access</h3>
            <form onSubmit={handleAddParent} className="space-y-4">
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input type="text" placeholder="Parent Name" className="w-full bg-slate-50 p-3.5 sm:p-4 pl-12 rounded-xl sm:rounded-2xl outline-none text-sm font-semibold transition-all focus:ring-2 focus:ring-indigo-500/20" required onChange={(e) => setParentForm({ ...parentForm, name: e.target.value })} />
              </div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input type="email" placeholder="Email Address" className="w-full bg-slate-50 p-3.5 sm:p-4 pl-12 rounded-xl sm:rounded-2xl outline-none text-sm font-semibold transition-all focus:ring-2 focus:ring-indigo-500/20" required onChange={(e) => setParentForm({ ...parentForm, email: e.target.value })} />
              </div>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input type="text" placeholder="Contact Number" className="w-full bg-slate-50 p-3.5 sm:p-4 pl-12 rounded-xl sm:rounded-2xl outline-none text-sm font-semibold transition-all focus:ring-2 focus:ring-indigo-500/20" required onChange={(e) => setParentForm({ ...parentForm, phone: e.target.value })} />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input type={showPassword ? "text" : "password"} placeholder="Portal Password"  className="w-full bg-slate-50 p-3.5 sm:p-4 pl-12 pr-12 rounded-xl sm:rounded-2xl outline-none text-sm font-semibold transition-all focus:ring-2 focus:ring-indigo-500/20" required onChange={(e) => setParentForm({ ...parentForm, password: e.target.value })} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-500 p-1">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-black shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 active:scale-95 text-xs sm:text-sm uppercase tracking-widest mt-2 disabled:opacity-70">
                {loading ? <Loader2 className="animate-spin" size={18} /> : "Generate Access & Email"}
              </button>
              <button type="button" onClick={() => setShowAddParentModal(false)} className="w-full text-slate-400 font-bold mt-2 text-sm">Go Back</button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: VIEW/EDIT PARENT --- */}
      {showViewParentModal && selectedParent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-[2.5rem] w-full max-w-sm relative shadow-2xl animate-in zoom-in-95">
            <button onClick={() => setShowViewParentModal(false)} className="absolute right-6 top-6 sm:right-8 sm:top-8 text-slate-300 hover:text-slate-500 transition-colors"><X size={20} /></button>
            <div className="text-center mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-indigo-50 text-indigo-600 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm shrink-0">
                <UserIcon size={32} className="sm:w-10 sm:h-10" />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-gray-800 uppercase tracking-tight">Parent Profile</h3>
              <button type="button" onClick={() => setIsEditingParent(!isEditingParent)} className="mt-1.5 text-indigo-600 text-[10px] sm:text-xs font-bold hover:underline uppercase tracking-wider">
                {isEditingParent ? "Cancel Edit" : "Edit Details"}
              </button>
            </div>
            <form onSubmit={handleUpdateParent} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <input type="text" disabled={!isEditingParent} value={editParentForm.name} className="w-full bg-slate-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl font-bold outline-none disabled:opacity-60 text-sm transition-all focus:ring-2 focus:ring-indigo-500/20" onChange={(e) => setEditParentForm({ ...editParentForm, name: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email</label>
                <input type="email" disabled={!isEditingParent} value={editParentForm.email} className="w-full bg-slate-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl font-bold outline-none disabled:opacity-60 text-sm transition-all focus:ring-2 focus:ring-indigo-500/20" onChange={(e) => setEditParentForm({ ...editParentForm, email: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Contact</label>
                <input type="text" disabled={!isEditingParent} value={editParentForm.phone} className="w-full bg-slate-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl font-bold outline-none disabled:opacity-60 text-sm transition-all focus:ring-2 focus:ring-indigo-500/20" onChange={(e) => setEditParentForm({ ...editParentForm, phone: e.target.value })} />
              </div>
              {isEditingParent && (
                <div className="bg-indigo-50/50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-indigo-100 transition-all focus-within:border-indigo-300 mt-2">
                  <label className="block text-[9px] sm:text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1 ml-1">Reset Password (Optional)</label>
                  <input type="text" value={editParentForm.password} className="w-full bg-transparent font-bold text-gray-800 outline-none text-xs sm:text-sm" onChange={(e) => setEditParentForm({ ...editParentForm, password: e.target.value })} placeholder="Enter new password" />
                </div>
              )}
              {isEditingParent ? (
                <button type="submit" disabled={loading} className="w-full mt-4 bg-indigo-600 text-white py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black shadow-lg flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all active:scale-95 text-xs sm:text-sm uppercase tracking-widest disabled:opacity-70">
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Save & Notify
                </button>
              ) : (
                <button type="button" onClick={() => setShowViewParentModal(false)} className="w-full mt-4 bg-gray-900 text-white py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black hover:bg-black transition-all active:scale-95 text-xs sm:text-sm uppercase tracking-widest">Close Profile</button>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Consistent scrollbar styling */}
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