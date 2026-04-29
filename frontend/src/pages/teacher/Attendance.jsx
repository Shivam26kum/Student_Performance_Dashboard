import { useEffect, useState } from "react";
import api from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import {
  Calendar,
  Save,
  Lock,
  Edit2,
  Download,
  FileSpreadsheet,
  X,
  Layers,
  ChevronRight,
  Loader2,
  Eye,
} from "lucide-react";
import { useToaster } from "react-toastella";

// --- CONFIGURATION ---
const ACADEMIC_YEARS = [
  { label: "2025-26", start: "2025-04-01", end: "2026-03-31" },
  { label: "2026-27", start: "2026-04-01", end: "2027-03-31" },
];

const getLocalToday = () => new Date().toISOString().split("T")[0];
const getFirstDayOfMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
};
const getLastMonthRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const end = new Date(now.getFullYear(), now.getMonth(), 0);
  return { start: start.toISOString().split("T")[0], end: end.toISOString().split("T")[0] };
};

const isSunday = (dateString) => new Date(dateString).getDay() === 0;

export default function Attendance() {
  const { notify } = useToaster();
  const { user } = useAuth();

  // --- SESSION LOGIC: Automatically detect current year ---
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

  const [selectedClass, setSelectedClass] = useState(() => {
    const savedClass = localStorage.getItem("teacher_dashboard_class");
    const savedTime = localStorage.getItem("teacher_dashboard_class_timestamp");
    if (savedClass && savedTime && Date.now() - parseInt(savedTime) < 3600000) return savedClass;
    return "";
  });

  const [assignedClasses, setAssignedClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getLocalToday());
  const [isLocked, setIsLocked] = useState(false);
  const [activeSubject, setActiveSubject] = useState("");

  const [showExportModal, setShowExportModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewData, setPreviewData] = useState({ dates: [], students: {} });
  const [exportDates, setExportDates] = useState({ start: getFirstDayOfMonth(), end: getLocalToday() });

  const presentCount = Object.values(attendance).filter((s) => s === "Present").length;
  const absentCount = Object.values(attendance).filter((s) => s === "Absent").length;

  const isDateInCurrentSession = (dateStr) => {
    const config = ACADEMIC_YEARS.find(y => y.label === academicYear);
    return config && dateStr >= config.start && dateStr <= config.end;
  };

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const { data } = await api.get("/api/teacher/my-classes");
        setAssignedClasses(data);
        if (selectedClass && !activeSubject) {
          const matched = data.find((c) => `${c.classGrade}-${c.section}` === selectedClass);
          if (matched) setActiveSubject(matched.subject);
        }
      } catch (err) { console.error("Failed classes", err); }
    };
    fetchClasses();
  }, []);

  useEffect(() => {
    if (!selectedClass) { setStudents([]); return; }
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const [grade, sec] = selectedClass.split("-");
        const { data } = await api.get(`/api/teacher/class-students?classGrade=${grade}&section=${sec}`);
        setStudents(data.sort((a, b) => a.rollNo.toString().localeCompare(b.rollNo.toString(), undefined, { numeric: true })));
      } catch (err) { console.error("Failed students", err); }
      finally { setLoading(false); }
    };
    fetchStudents();
  }, [selectedClass]);

  useEffect(() => {
    if (students.length === 0 || !activeSubject) return;
    if (isSunday(selectedDate)) {
      setAttendance(students.reduce((acc, s) => ({ ...acc, [s._id]: "Weekend" }), {}));
      setIsLocked(true);
      return;
    }
    const fetchDateData = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/api/teacher/attendance/${selectedDate}?subject=${encodeURIComponent(activeSubject)}`);
        const dbMap = {};
        const studentIds = students.map((s) => s._id);
        const relevant = data.filter((record) => studentIds.includes(record.student));

        if (relevant.length > 0) {
          relevant.forEach((r) => (dbMap[r.student] = r.status));
          students.forEach((s) => { if (!dbMap[s._id]) dbMap[s._id] = "Absent"; });
          setAttendance(dbMap);
          setIsLocked(true);
        } else {
          setAttendance(students.reduce((acc, s) => ({ ...acc, [s._id]: "Absent" }), {}));
          setIsLocked(!isDateInCurrentSession(selectedDate));
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchDateData();
  }, [selectedDate, students, activeSubject, academicYear]);

  // --- HANDLERS ---
  const handleClassChange = (e) => {
    const val = e.target.value;
    setSelectedClass(val);
    if (val) {
      localStorage.setItem("teacher_dashboard_class", val);
      localStorage.setItem("teacher_dashboard_class_timestamp", Date.now().toString());
      const matched = assignedClasses.find((c) => `${c.classGrade}-${c.section}` === val);
      if (matched) setActiveSubject(matched.subject);
    }
  };

  const toggleStatus = (id) => {
    if (isLocked || isSunday(selectedDate)) return;
    setAttendance((p) => ({ ...p, [id]: p[id] === "Present" ? "Absent" : "Present" }));
  };

  const handleSubmit = async () => {
    if (!activeSubject) return notify({ message: "Select a subject.", type: "error" });
    setLoading(true);
    try {
      const attendanceData = students.map((s) => ({ studentId: s._id, status: attendance[s._id] || "Absent" }));
      await api.post("/api/teacher/mark-attendance", { date: selectedDate, attendanceData, subject: activeSubject });
      notify({ message: "Attendance saved!", type: "success" });
      setIsLocked(true);
    } catch (err) { notify({ message: "Failed to save.", type: "error" }); }
    finally { setLoading(false); }
  };

  const prepareMatrixData = async () => {
    const url = `/api/teacher/attendance-report?startDate=${exportDates.start}&endDate=${exportDates.end}&subject=${encodeURIComponent(activeSubject)}`;
    const { data } = await api.get(url);
    if (!data || data.length === 0) return null;
    const uniqueDates = [...new Set(data.map((item) => item.date.split("T")[0]))].sort();
    const studentMap = {};
    data.forEach((r) => {
      if (r.student && !studentMap[r.student._id]) {
        studentMap[r.student._id] = { name: r.student.name || "Unknown", rollNo: r.student.rollNo || "-", attendance: {} };
      }
      if (r.student) studentMap[r.student._id].attendance[r.date.split("T")[0]] = r.status;
    });
    return { uniqueDates, studentMap };
  };

  const handlePreview = async () => {
    setLoading(true);
    try {
      const result = await prepareMatrixData();
      if (!result) return notify({ message: "No records found.", type: "error" });
      setPreviewData({ dates: result.uniqueDates, students: result.studentMap });
      setShowPreviewModal(true);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      const result = await prepareMatrixData();
      if (!result) return notify({ message: "No data.", type: "error" });

      const { studentMap } = result;
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(`Attendance`);

      const allDatesInRange = [];
      let curr = new Date(exportDates.start);
      const end = new Date(exportDates.end);
      while (curr <= end) {
        allDatesInRange.push(curr.toISOString().split("T")[0]);
        curr.setDate(curr.getDate() + 1);
      }

      const centerAlignment = { horizontal: "center", vertical: "middle" };
      const standardFont = { name: "Arial", size: 10 };

      const headers = ["Roll No", "Name", ...allDatesInRange, "Present", "Total", "%"];
      const headerRow = worksheet.addRow(headers);
      headerRow.font = { ...standardFont, bold: true };
      headerRow.alignment = centerAlignment;

      Object.values(studentMap).forEach((student) => {
        let p = 0; let t = 0;
        const rowData = [student.rollNo, student.name];

        allDatesInRange.forEach((date) => {
          const status = student.attendance[date];
          if (isSunday(date)) {
            rowData.push("W");
          } else if (!status) {
            rowData.push("-");
          } else {
            const val = status === "Present" ? "P" : "A";
            rowData.push(val);
            if (val === "P") p++;
            t++;
          }
        });

        const perc = t > 0 ? ((p / t) * 100).toFixed(1) + "%" : "0%";
        rowData.push(p, t, perc);
        const row = worksheet.addRow(rowData);
        row.alignment = centerAlignment;
        row.font = standardFont;

        row.eachCell((cell) => {
          if (cell.value === "P") cell.font = { ...standardFont, color: { argb: "FF008000" }, bold: true };
          if (cell.value === "A") cell.font = { ...standardFont, color: { argb: "FFFF0000" }, bold: true };
          if (cell.value === "W") cell.font = { ...standardFont, color: { argb: "FF808080" } };
        });
      });

      worksheet.columns.forEach(col => { col.width = 10; });
      worksheet.getColumn(2).width = 25;

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), `${activeSubject}_Attendance.xlsx`);
      setShowExportModal(false);
      notify({ message: "Exported successfully!", type: "success" });
    } catch (err) { notify({ message: "Export failed.", type: "error" }); }
    finally { setLoading(false); }
  };

  const applyLastMonth = () => setExportDates(getLastMonthRange());
  const applyThisMonth = () => setExportDates({ start: getFirstDayOfMonth(), end: getLocalToday() });
  const applyAcademicYear = () => {
    const config = ACADEMIC_YEARS.find(y => y.label === academicYear) || ACADEMIC_YEARS[0];
    setExportDates({ start: config.start, end: config.end });
  };
  const applyLastSession = () => {
    setExportDates({ start: "2024-04-01", end: "2025-03-31" });
  };

  return (
    // Fixed: Allowed container to grow natively on mobile rather than rigid calc constraints
    <div className="flex flex-col h-full md:h-[calc(100vh-3rem)] max-w-6xl mx-auto w-full p-4 sm:p-6 lg:p-8 pb-2 font-sans">
      
      {/* HEADER */}
      <div className="shrink-0 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-xl shadow-sm border border-gray-100 mb-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0"><Calendar size={24} /></div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2 truncate">
                Register {isLocked && <Lock size={16} className="text-gray-400 shrink-0" />}
              </h2> 
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1">
                <span className="text-[9px] sm:text-[10px] font-black text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded whitespace-nowrap">Session {academicYear}</span>
                <ChevronRight size={14} className="text-gray-300 hidden sm:block" />
                <span className="text-[9px] sm:text-[10px] font-black text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded whitespace-nowrap truncate max-w-[120px] sm:max-w-none">{activeSubject || "No Subject"}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <select className="w-full sm:w-auto bg-gray-50 p-2.5 sm:p-2 rounded-lg text-sm font-bold outline-none cursor-pointer border border-gray-200 sm:border-none focus:ring-2 focus:ring-indigo-500/20" value={selectedClass} onChange={handleClassChange}>
              <option value="">Select Class</option>
              {[...new Set(assignedClasses.map((c) => `${c.classGrade}-${c.section}`))].map((cls, idx) => (
                <option key={idx} value={cls}>Class {cls}</option>
              ))}
            </select>
            <select className="w-full sm:w-auto bg-gray-50 p-2.5 sm:p-2 rounded-lg text-sm font-bold outline-none cursor-pointer border border-gray-200 sm:border-none focus:ring-2 focus:ring-indigo-500/20" value={activeSubject} onChange={(e) => setActiveSubject(e.target.value)} disabled={!selectedClass}>
              <option value="">Select Subject</option>
              {assignedClasses.filter((c) => `${c.classGrade}-${c.section}` === selectedClass).map((cls, idx) => (
                <option key={idx} value={cls.subject}>{cls.subject}</option>
              ))}
            </select>
          </div>
        </div>

        {selectedClass && activeSubject && (
          // Fixed: Wrapped flex containers to stack appropriately on mobile
          <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between gap-4 pt-4 mt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input type="date" value={selectedDate} max={getLocalToday()} onChange={(e) => setSelectedDate(e.target.value)} 
                className={`w-full sm:w-auto bg-gray-50 p-2.5 sm:p-2 rounded-lg text-xs font-bold outline-none border border-gray-200 sm:border-none focus:ring-2 focus:ring-indigo-500/20 ${!isDateInCurrentSession(selectedDate) ? "ring-2 ring-amber-500" : ""}`} />
              <button onClick={handlePreview} className="p-2.5 sm:p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg bg-white shadow-sm border border-gray-200 sm:border-gray-100 transition-all shrink-0"><Eye size={18} className="sm:w-5 sm:h-5" /></button>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3 items-center justify-between w-full sm:w-auto">
              {/* Fixed: Show stats on mobile too, but formatted nicely */}
              <div className="flex items-center gap-2 sm:gap-4 sm:mr-2 text-[9px] sm:text-[10px] font-black uppercase">
                <span className="text-emerald-600 px-2 sm:px-3 py-1.5 sm:py-1 bg-emerald-50 border border-emerald-100 rounded-lg">{presentCount} Present</span>
                <span className="text-rose-500 px-2 sm:px-3 py-1.5 sm:py-1 bg-rose-50 border border-rose-100 rounded-lg">{absentCount} Absent</span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {isLocked && !isSunday(selectedDate) && isDateInCurrentSession(selectedDate) && (
                  <button onClick={() => setIsLocked(false)} className="flex-1 sm:flex-none justify-center bg-blue-50 text-blue-600 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs font-black uppercase tracking-tighter transition hover:bg-blue-100 flex items-center gap-1.5"><Edit2 size={14} /> Unlock</button>
                )}
                <button onClick={() => setShowExportModal(true)} className="flex-1 sm:flex-none justify-center bg-slate-900 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs font-black uppercase tracking-tighter hover:bg-black flex items-center gap-1.5"><FileSpreadsheet size={14} /> Export</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* TABLE / EMPTY STATE */}
      {!selectedClass || !activeSubject ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-white border border-gray-100 p-8 sm:p-20 text-center rounded-2xl sm:rounded-3xl shadow-sm">
          <Layers size={40} className="mx-auto mb-4 text-gray-200 sm:w-12 sm:h-12" />
          <p className="text-gray-400 font-black uppercase text-[10px] sm:text-xs tracking-widest">Select Class & Subject to begin</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0 bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          
          <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar w-full">
            {/* Fixed: Min-width ensures columns don't crush on mobile */}
            <table className="w-full text-left relative min-w-[500px]">
              <thead className="bg-gray-50/95 backdrop-blur-sm sticky top-0 z-10">
                <tr className="border-b border-gray-100">
                  <th className="p-4 sm:p-5 text-[10px] font-black uppercase text-gray-400 tracking-widest whitespace-nowrap">Roll No</th>
                  <th className="p-4 sm:p-5 text-[10px] font-black uppercase text-gray-400 tracking-widest whitespace-nowrap">Full Name</th>
                  <th className="p-4 sm:p-5 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center whitespace-nowrap">Mark Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan="3" className="p-20 sm:p-32 text-center text-gray-400 text-sm"><Loader2 className="animate-spin inline-block mr-2" size={18} /> Loading Students...</td></tr>
                ) : (
                  students.map((s) => (
                    <tr key={s._id} onClick={() => toggleStatus(s._id)} className={`cursor-pointer hover:bg-indigo-50/30 transition-colors ${isLocked ? "pointer-events-none opacity-80" : ""}`}>
                      <td className="p-4 sm:p-5 font-mono text-xs sm:text-sm text-gray-400 whitespace-nowrap">{s.rollNo}</td>
                      <td className="p-4 sm:p-5 font-bold text-sm sm:text-base text-gray-700 whitespace-nowrap">{s.name}</td>
                      <td className="p-4 sm:p-5 text-center whitespace-nowrap">
                        <span className={`px-4 sm:px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm transition-all inline-block min-w-[90px] ${attendance[s._id] === "Present" ? "bg-emerald-500 text-white" : attendance[s._id] === "Weekend" ? "bg-gray-100 text-gray-500" : "bg-rose-500 text-white"}`}>
                          {attendance[s._id] || "Absent"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!isLocked && selectedClass && activeSubject && students.length > 0 && isDateInCurrentSession(selectedDate) && (
            <div className="shrink-0 p-4 sm:p-5 bg-white border-t border-gray-100 flex justify-end shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20 relative">
              {/* Fixed: Button stretches to full width on mobile */}
              <button onClick={handleSubmit} disabled={loading} className="w-full sm:w-auto flex justify-center items-center gap-2 bg-emerald-600 text-white px-8 sm:px-12 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 active:scale-95 transition-all shadow-lg shadow-emerald-100 disabled:opacity-70">
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Finalize Attendance
              </button>
            </div>
          )}
        </div>
      )}

      {/* EXPORT MODAL */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl sm:rounded-[2.5rem] p-6 sm:p-8 w-full max-w-md shadow-2xl border border-gray-100 animate-in zoom-in-95">
            <h3 className="text-lg sm:text-xl font-black text-gray-900 mb-5 sm:mb-6 flex items-center gap-3"><div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><FileSpreadsheet size={20} /></div> Attendance Reports</h3>
            {/* Fixed: Scrollable tabs so they don't break flex layout */}
            <div className="flex gap-2 mb-5 sm:mb-6 overflow-x-auto pb-2 custom-scrollbar">
              <button onClick={applyLastMonth} className="whitespace-nowrap px-3 sm:px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black text-gray-500 hover:bg-gray-100 uppercase tracking-widest transition-colors">Last Month</button>
              <button onClick={applyThisMonth} className="whitespace-nowrap px-3 sm:px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black text-indigo-600 hover:bg-indigo-100 uppercase tracking-widest transition-colors">This Month</button>
              <button onClick={applyAcademicYear} className="whitespace-nowrap px-3 sm:px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black text-emerald-600 hover:bg-emerald-100 uppercase tracking-widest transition-colors">Session</button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 pl-1">Start Date</label>
                  <input type="date" className="w-full bg-gray-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl outline-none font-bold text-xs border border-gray-100 focus:border-indigo-300" value={exportDates.start} onChange={(e) => setExportDates({ ...exportDates, start: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 pl-1">End Date</label>
                  <input type="date" className="w-full bg-gray-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl outline-none font-bold text-xs border border-gray-100 focus:border-indigo-300" value={exportDates.end} onChange={(e) => setExportDates({ ...exportDates, end: e.target.value })} />
                </div>
              </div>
              <button onClick={handlePreview} className="w-full bg-white border border-gray-200 text-gray-800 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all">Preview Matrix</button>
              <button onClick={handleExport} className="w-full bg-slate-900 text-white py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black shadow-xl shadow-slate-200 transition-all">Download Excel</button>
              <button onClick={() => setShowExportModal(false)} className="w-full py-3 text-gray-400 font-bold text-[10px] uppercase tracking-widest hover:text-gray-600 transition-colors mt-1">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 sm:p-6">
          <div className="bg-white rounded-2xl sm:rounded-[3rem] w-full h-[90vh] max-w-7xl shadow-2xl flex flex-col overflow-hidden border border-white/20 animate-in zoom-in-95">
            <div className="p-4 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-50">
              <div>
                <h3 className="text-lg sm:text-2xl font-black text-gray-900 uppercase flex items-center gap-2 sm:gap-3">Register Matrix</h3>
                <p className="text-[9px] sm:text-[10px] text-emerald-600 font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] mt-1">{activeSubject} • Session {academicYear}</p>
              </div>
              <div className="flex w-full sm:w-auto gap-2 sm:gap-3">
                <button onClick={handleExport} className="flex-1 sm:flex-none justify-center bg-indigo-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-2"><Download size={14} className="sm:w-4 sm:h-4" /> Export</button>
                <button onClick={() => setShowPreviewModal(false)} className="shrink-0 bg-gray-50 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl text-gray-400 hover:bg-rose-50 hover:text-rose-500 transition-colors"><X size={20} className="sm:w-6 sm:h-6" /></button>
              </div>
            </div>
            
            {/* Matrix Table */}
            <div className="flex-1 overflow-auto p-0 sm:p-4 custom-scrollbar bg-gray-50/30">
              <table className="min-w-full text-left relative border-separate border-spacing-0">
                <thead className="sticky top-0 z-20">
                  <tr>
                    {/* Fixed: Adjusted sticky left positions for mobile so the scrollable area isn't consumed entirely by sticky columns */}
                    <th className="sticky left-0 bg-white p-3 sm:p-4 text-[9px] sm:text-[10px] font-black uppercase text-gray-400 z-30 border-b-2 border-r border-gray-100 min-w-[40px] sm:min-w-[64px]">Roll</th>
                    <th className="sticky left-[40px] sm:left-[64px] bg-white p-3 sm:p-4 text-[9px] sm:text-[10px] font-black uppercase text-gray-400 z-30 min-w-[120px] sm:min-w-[192px] border-b-2 border-r border-gray-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">Student Name</th>
                    {previewData.dates.map((date) => (
                      <th key={date} className="p-2 sm:p-4 text-[8px] sm:text-[9px] font-black text-gray-400 uppercase text-center min-w-[40px] sm:min-w-[64px] border-b-2 border-r border-gray-100 bg-gray-50/80 backdrop-blur-sm">
                        {new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                      </th>
                    ))}
                    <th className="bg-emerald-50 p-3 sm:p-4 text-[9px] sm:text-[10px] font-black uppercase text-emerald-600 text-center border-b-2 border-emerald-100 sticky right-[80px] sm:right-24 z-20">P</th>
                    <th className="bg-rose-50 p-3 sm:p-4 text-[9px] sm:text-[10px] font-black uppercase text-rose-600 text-center border-b-2 border-rose-100 sticky right-[40px] sm:right-12 z-20">T</th>
                    <th className="bg-slate-900 p-3 sm:p-4 text-[9px] sm:text-[10px] font-black uppercase text-white text-center border-b-2 border-slate-900 sticky right-0 z-20">%</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(previewData.students).map((s, idx) => {
                    let pCount = 0; let tCount = 0;
                    return (
                      <tr key={idx} className="hover:bg-indigo-50/30 transition-colors group">
                        <td className="sticky left-0 bg-white p-3 sm:p-4 text-[9px] sm:text-[10px] font-mono font-black text-gray-400 group-hover:bg-indigo-50 border-b border-r border-gray-100 z-10 transition-colors">{s.rollNo}</td>
                        <td className="sticky left-[40px] sm:left-[64px] bg-white p-3 sm:p-4 text-[10px] sm:text-xs font-black text-gray-800 group-hover:bg-indigo-50 border-b border-r border-gray-100 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] transition-colors truncate max-w-[120px] sm:max-w-none">{s.name}</td>
                        {previewData.dates.map((date) => {
                          const status = s.attendance[date];
                          if (status) tCount++;
                          if (status === "Present") pCount++;
                          return (
                            <td key={date} className="p-1 sm:p-2 border-b border-r border-gray-100 text-center bg-white group-hover:bg-indigo-50/10">
                              {status === "Present" ? (
                                <span className="w-5 h-5 sm:w-7 sm:h-7 rounded sm:rounded-lg bg-emerald-50 text-emerald-600 font-black text-[8px] sm:text-[9px] flex items-center justify-center mx-auto">P</span>
                              ) : status === "Absent" ? (
                                <span className="w-5 h-5 sm:w-7 sm:h-7 rounded sm:rounded-lg bg-rose-50 text-rose-500 font-black text-[8px] sm:text-[9px] flex items-center justify-center mx-auto">A</span>
                              ) : (
                                <span className="text-gray-200 text-[8px] sm:text-[10px]">•</span>
                              )}
                            </td>
                          );
                        })}
                        <td className="p-3 sm:p-4 text-center text-[10px] sm:text-xs font-black text-emerald-600 bg-emerald-50/50 border-b border-emerald-50/50 sticky right-[80px] sm:right-24 z-10">{pCount}</td>
                        <td className="p-3 sm:p-4 text-center text-[10px] sm:text-xs font-black text-rose-600 bg-rose-50/50 border-b border-rose-50/50 sticky right-[40px] sm:right-12 z-10">{tCount}</td>
                        <td className={`p-3 sm:p-4 text-center text-[10px] sm:text-xs font-black border-b sticky right-0 z-10 ${((pCount / (tCount || 1)) * 100) < 75 ? "text-rose-600 bg-rose-50 border-rose-100" : "text-slate-900 bg-gray-50 border-gray-100"}`}>
                          {tCount > 0 ? ((pCount / tCount) * 100).toFixed(0) : 0}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-corner { background: transparent; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}} />
    </div>
  );
}