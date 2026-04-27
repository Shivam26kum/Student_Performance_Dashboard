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
    <div className="flex flex-col h-[calc(100vh-3rem)] max-w-5xl mx-auto w-full p-4 pb-2 font-sans">
      
      {/* HEADER */}
      <div className="shrink-0 bg-white p-6 rounded-xl shadow-sm mb-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Calendar size={24} /></div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                Register {isLocked && <Lock size={16} className="text-gray-400" />}
              </h2> 
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-black text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded">Session {academicYear}</span>
                <ChevronRight size={14} className="text-gray-300" />
                <span className="text-[10px] font-black text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded">{activeSubject || "No Subject"}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <select className="bg-gray-50 p-2 rounded-lg text-sm font-bold outline-none cursor-pointer border-none" value={selectedClass} onChange={handleClassChange}>
              <option value="">Select Class</option>
              {[...new Set(assignedClasses.map((c) => `${c.classGrade}-${c.section}`))].map((cls, idx) => (
                <option key={idx} value={cls}>Class {cls}</option>
              ))}
            </select>
            <select className="bg-gray-50 p-2 rounded-lg text-sm font-bold outline-none cursor-pointer border-none" value={activeSubject} onChange={(e) => setActiveSubject(e.target.value)} disabled={!selectedClass}>
              <option value="">Select Subject</option>
              {assignedClasses.filter((c) => `${c.classGrade}-${c.section}` === selectedClass).map((cls, idx) => (
                <option key={idx} value={cls.subject}>{cls.subject}</option>
              ))}
            </select>
          </div>
        </div>

        {selectedClass && activeSubject && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 mt-4 border-t border-gray-50">
            <div className="flex items-center gap-2">
              <input type="date" value={selectedDate} max={getLocalToday()} onChange={(e) => setSelectedDate(e.target.value)} 
                className={`bg-gray-50 p-2 rounded-lg text-xs font-bold outline-none border-none ${!isDateInCurrentSession(selectedDate) ? "ring-2 ring-amber-500" : ""}`} />
              <button onClick={handlePreview} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg bg-white shadow-sm border border-gray-100 transition-all"><Eye size={20} /></button>
            </div>
            <div className="flex gap-2 items-center">
              <div className="hidden sm:flex items-center gap-4 mr-4 text-[10px] font-black uppercase">
                <span className="text-emerald-600 px-2 py-1 bg-emerald-50 rounded-lg">{presentCount} Present</span>
                <span className="text-rose-500 px-2 py-1 bg-rose-50 rounded-lg">{absentCount} Absent</span>
              </div>
              {isLocked && !isSunday(selectedDate) && isDateInCurrentSession(selectedDate) && (
                <button onClick={() => setIsLocked(false)} className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-tighter transition hover:bg-blue-100 flex items-center gap-2"><Edit2 size={14} /> Unlock</button>
              )}
              <button onClick={() => setShowExportModal(true)} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-black uppercase tracking-tighter hover:bg-black flex items-center gap-2"><FileSpreadsheet size={16} /> Export</button>
            </div>
          </div>
        )}
      </div>

      {/* TABLE / EMPTY STATE */}
      {!selectedClass || !activeSubject ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-white border border-gray-100 p-20 text-center rounded-3xl shadow-sm">
          <Layers size={48} className="mx-auto mb-4 text-gray-200" />
          <p className="text-gray-400 font-black uppercase text-xs tracking-widest">Select Class & Subject to begin</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <table className="w-full text-left relative">
              <thead className="bg-gray-50/95 backdrop-blur-sm sticky top-0 z-10">
                <tr className="border-b border-gray-100">
                  <th className="p-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">Roll No</th>
                  <th className="p-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">Full Name</th>
                  <th className="p-5 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Mark Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan="3" className="p-32 text-center text-gray-400"><Loader2 className="animate-spin inline-block mr-2" /> Loading Students...</td></tr>
                ) : (
                  students.map((s) => (
                    <tr key={s._id} onClick={() => toggleStatus(s._id)} className={`cursor-pointer hover:bg-indigo-50/30 transition-colors ${isLocked ? "pointer-events-none opacity-80" : ""}`}>
                      <td className="p-5 font-mono text-sm text-gray-400">{s.rollNo}</td>
                      <td className="p-5 font-bold text-gray-700">{s.name}</td>
                      <td className="p-5 text-center">
                        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm ${attendance[s._id] === "Present" ? "bg-emerald-500 text-white" : attendance[s._id] === "Weekend" ? "bg-gray-100 text-gray-500" : "bg-rose-500 text-white"}`}>
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
            <div className="shrink-0 p-5 bg-white border-t border-gray-100 flex justify-end">
              <button onClick={handleSubmit} disabled={loading} className="bg-emerald-600 text-white px-12 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 active:scale-95 transition-all shadow-lg shadow-emerald-100">
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={18} />} Finalize Attendance
              </button>
            </div>
          )}
        </div>
      )}

      {/* EXPORT MODAL */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl border border-gray-100 animate-in zoom-in-95">
            <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3"><div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><FileSpreadsheet size={20} /></div> Attendance Reports</h3>
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
              <button onClick={applyLastMonth} className="whitespace-nowrap px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-[10px] font-black text-gray-500 hover:bg-gray-100 uppercase tracking-widest">Last Month</button>
              <button onClick={applyThisMonth} className="whitespace-nowrap px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-xl text-[10px] font-black text-indigo-600 hover:bg-indigo-100 uppercase tracking-widest">This Month</button>
              <button onClick={applyAcademicYear} className="whitespace-nowrap px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl text-[10px] font-black text-emerald-600 hover:bg-emerald-100 uppercase tracking-widest">Current Session</button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <input type="date" className="w-full bg-gray-50 p-4 rounded-2xl outline-none font-bold text-xs border border-gray-100" value={exportDates.start} onChange={(e) => setExportDates({ ...exportDates, start: e.target.value })} />
                <input type="date" className="w-full bg-gray-50 p-4 rounded-2xl outline-none font-bold text-xs border border-gray-100" value={exportDates.end} onChange={(e) => setExportDates({ ...exportDates, end: e.target.value })} />
              </div>
              <button onClick={handlePreview} className="w-full bg-white border border-gray-200 text-gray-800 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all">Preview Matrix</button>
              <button onClick={handleExport} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black shadow-xl shadow-slate-200 transition-all">Download Excel</button>
              <button onClick={() => setShowExportModal(false)} className="w-full py-2 text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-2">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-[3rem] w-full h-[90vh] max-w-7xl shadow-2xl flex flex-col overflow-hidden border border-white/20">
            <div className="p-8 flex justify-between items-center border-b border-gray-50">
              <div>
                <h3 className="text-2xl font-black text-gray-900 uppercase flex items-center gap-3">Register Matrix</h3>
                <p className="text-[10px] text-emerald-600 font-black uppercase tracking-[0.2em] mt-1">{activeSubject} • Session {academicYear}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={handleExport} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-2"><Download size={16} /> Export</button>
                <button onClick={() => setShowPreviewModal(false)} className="bg-gray-50 p-3 rounded-2xl text-gray-400 hover:text-rose-500 transition-colors"><X size={24} /></button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 custom-scrollbar">
              <table className="min-w-full text-left relative border-separate border-spacing-0">
                <thead className="sticky top-0 z-20">
                  <tr>
                    <th className="sticky left-0 bg-white p-4 text-[10px] font-black uppercase text-gray-400 z-30 border-b-2 border-gray-100">Roll</th>
                    <th className="sticky left-16 bg-white p-4 text-[10px] font-black uppercase text-gray-400 z-30 min-w-48 border-b-2 border-gray-100">Student Name</th>
                    {previewData.dates.map((date) => (
                      <th key={date} className="p-4 text-[9px] font-black text-gray-400 uppercase text-center min-w-16 border-b-2 border-gray-100 bg-gray-50/50">
                        {new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                      </th>
                    ))}
                    <th className="bg-emerald-50 p-4 text-[10px] font-black uppercase text-emerald-600 text-center border-b-2 border-emerald-100">P</th>
                    <th className="bg-rose-50 p-4 text-[10px] font-black uppercase text-rose-600 text-center border-b-2 border-rose-100">T</th>
                    <th className="bg-slate-900 p-4 text-[10px] font-black uppercase text-white text-center border-b-2 border-slate-900">%</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(previewData.students).map((s, idx) => {
                    let pCount = 0; let tCount = 0;
                    return (
                      <tr key={idx} className="hover:bg-indigo-50/20 transition-colors group">
                        <td className="sticky left-0 bg-white p-4 text-[10px] font-mono font-black text-gray-300 group-hover:bg-indigo-50/20 transition-colors border-b border-gray-50">{s.rollNo}</td>
                        <td className="sticky left-16 bg-white p-4 text-xs font-black text-gray-800 group-hover:bg-indigo-50/20 transition-colors border-b border-gray-50">{s.name}</td>
                        {previewData.dates.map((date) => {
                          const status = s.attendance[date];
                          if (status) tCount++;
                          if (status === "Present") pCount++;
                          return (
                            <td key={date} className="p-2 border-b border-gray-50 text-center">
                              {status === "Present" ? (
                                <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 font-black text-[9px] flex items-center justify-center mx-auto shadow-sm">P</span>
                              ) : status === "Absent" ? (
                                <span className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 font-black text-[9px] flex items-center justify-center mx-auto shadow-sm">A</span>
                              ) : (
                                <span className="text-gray-200 text-[10px]">•</span>
                              )}
                            </td>
                          );
                        })}
                        <td className="p-4 text-center text-xs font-black text-emerald-600 bg-emerald-50/30 border-b border-emerald-50">{pCount}</td>
                        <td className="p-4 text-center text-xs font-black text-rose-600 bg-rose-50/30 border-b border-rose-50">{tCount}</td>
                        <td className={`p-4 text-center text-xs font-black border-b border-slate-100 ${((pCount / (tCount || 1)) * 100) < 75 ? "text-rose-600 bg-rose-50/50" : "text-slate-900 bg-gray-50"}`}>
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
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #e2e8f0; border-radius: 10px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}} />
    </div>
  );
}