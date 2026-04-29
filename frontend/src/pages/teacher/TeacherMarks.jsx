import { useEffect, useState } from "react";
import api from "../../api/api";
import { useToaster } from "react-toastella";
import { 
  ClipboardCheck, Save, Loader2, Layers, 
  Filter, History, Unlock, Clock, Plus, Download, FileText, Table, X,
  Lock as LockIcon, Trash2 
} from "lucide-react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

export default function TeacherMarks() {
  const { notify } = useToaster();

  // --- PERSISTENCE LOGIC ---
  const getInitialClass = () => {
    const savedId = localStorage.getItem("teacher_dashboard_class_id");
    const savedTime = localStorage.getItem("teacher_dashboard_class_timestamp");
    if (savedId && savedTime && Date.now() - parseInt(savedTime) < 3600000) {
      const parts = savedId.split("-");
      if (parts.length >= 3) return `${parts[0]}|${parts[1]}|${parts.slice(2).join("-")}`;
    }
    return "";
  };

  const getInitialSubject = () => {
    const savedId = localStorage.getItem("teacher_dashboard_class_id");
    const savedTime = localStorage.getItem("teacher_dashboard_class_timestamp");
    if (savedId && savedTime && Date.now() - parseInt(savedTime) < 3600000) {
      const parts = savedId.split("-");
      if (parts.length >= 3) return parts.slice(2).join("-");
    }
    return "";
  };

  // --- STATES ---
  const [assignedClasses, setAssignedClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(getInitialClass); 
  const [activeSubject, setActiveSubject] = useState(getInitialSubject);
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({}); 
  const [examName, setExamName] = useState("");
  const [totalMarks, setTotalMarks] = useState(100);
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false); 
  const [lastUpdated, setLastUpdated] = useState(null); 
  const [listFilter, setListFilter] = useState("default");
  const [pastExams, setPastExams] = useState([]);
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    const fetchInit = async () => {
      try {
        const { data } = await api.get("/api/teacher/my-classes");
        setAssignedClasses(data);
      } catch (err) { console.error(err); }
    };
    fetchInit();
  }, []);

  const fetchPastExams = async (grade, sec, subject) => {
    try {
      const { data } = await api.get(`/api/teacher/class-exams?classGrade=${grade}&section=${sec}&subject=${encodeURIComponent(subject)}`);
      setPastExams(data);
    } catch (err) { console.error("History fetch failed"); }
  };

  useEffect(() => {
    if (!selectedClass) {
      setStudents([]);
      setPastExams([]);
      setIsSubmitted(false);
      return;
    }
    const fetchData = async () => {
      setLoading(true);
      try {
        const [grade, sec] = selectedClass.split("|");
        const studentRes = await api.get(`/api/teacher/class-students?classGrade=${grade}&section=${sec}`);
        setStudents(studentRes.data.sort((a, b) => a.rollNo.toString().localeCompare(b.rollNo.toString(), undefined, { numeric: true })));
        
        if (activeSubject) {
          fetchPastExams(grade, sec, activeSubject);
        }
      } catch (err) { notify({ message: "Load failed", type: "error" }); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [selectedClass, activeSubject]);

  useEffect(() => {
    const fetchExistingMarks = async () => {
      if (!selectedClass || !examName.trim() || !activeSubject) { setIsSubmitted(false); return; }
      try {
        const [grade, sec] = selectedClass.split("|");
        const { data } = await api.get(`/api/teacher/get-performance?examName=${encodeURIComponent(examName.trim())}&subject=${encodeURIComponent(activeSubject)}&classGrade=${grade}&section=${sec}`);
        if (data && data.length > 0) {
          const map = {};
          data.forEach(r => map[r.student] = r.marksObtained);
          setMarks(map);
          setTotalMarks(data[0].totalMarks);
          setIsSubmitted(true);
          setLastUpdated(data[0].updatedAt || data[0].createdAt || null);
        } else { setIsSubmitted(false); }
      } catch (err) { setIsSubmitted(false); }
    };
    const debounce = setTimeout(fetchExistingMarks, 400);
    return () => clearTimeout(debounce);
  }, [selectedClass, examName, activeSubject]);

  // --- DELETE LOGIC ---
  const handleDeleteExam = async (e, examToDelete) => {
    e.stopPropagation(); 
    if (!window.confirm(`Are you sure you want to permanently delete all records for "${examToDelete}"?`)) return;

    try {
      const [grade, sec] = selectedClass.split("|");
      await api.delete(`/api/teacher/delete-performance?examName=${encodeURIComponent(examToDelete)}&subject=${encodeURIComponent(activeSubject)}&classGrade=${grade}&section=${sec}`);
      
      notify({ message: "Exam record deleted", type: "success" });
      
      if (examName === examToDelete) {
        resetToNewEntry();
      }
      
      fetchPastExams(grade, sec, activeSubject);
    } catch (err) {
      notify({ message: "Delete failed", type: "error" });
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const tableRows = processedStudents.map(s => [
      s.rollNo, s.name, marks[s._id] || 0, totalMarks,
      (Number(marks[s._id] || 0) / Number(totalMarks) >= 0.33) ? "PASS" : "FAIL"
    ]);
    doc.setFontSize(16);
    doc.text(`Result: ${examName}`, 14, 15);
    doc.autoTable({
      head: [["Roll No", "Student Name", "Obtained", "Total", "Status"]],
      body: tableRows,
      startY: 30,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42] }
    });
    doc.save(`${examName}_Marks.pdf`);
    setShowExportModal(false);
  };

  const exportExcel = () => {
    const data = processedStudents.map(s => ({
      "Roll No": s.rollNo, "Student Name": s.name, "Marks Obtained": marks[s._id] || 0, "Total Marks": totalMarks,
      "Status": (Number(marks[s._id] || 0) / Number(totalMarks) >= 0.33) ? "PASS" : "FAIL"
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Marks");
    XLSX.writeFile(wb, `${examName}_Marks.xlsx`);
    setShowExportModal(false);
  };

  const handleClassChange = (val) => {
    setSelectedClass(val);
    setMarks({});
    setExamName("");
    setIsSubmitted(false);
    if (!val) setActiveSubject("");
    else setActiveSubject(val.split("|")[2]);
  };

  const resetToNewEntry = () => {
    setExamName("");
    setMarks({});
    setIsSubmitted(false);
    setLastUpdated(null);
  };

  const handleMarkChange = (id, val) => {
    if (isSubmitted) return;
    if (val !== "" && Number(val) > Number(totalMarks)) return notify({ message: "Exceeds max", type: "error" });
    setMarks(prev => ({ ...prev, [id]: val }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const [grade, sec] = selectedClass.split("|");
      const marksData = students.map(s => ({ studentId: s._id, marksObtained: marks[s._id] || 0 }));
      await api.post("/api/teacher/submit-performance", { examName, totalMarks, subject: activeSubject, classGrade: grade, section: sec, marksData });
      notify({ message: "Saved and locked", type: "success" });
      setIsSubmitted(true);
      setLastUpdated(new Date().toISOString());
      fetchPastExams(grade, sec, activeSubject); 
    } catch (err) { notify({ message: "Save failed", type: "error" }); }
    finally { setLoading(false); }
  };

  const formatDateTime = (str) => {
    if (!str) return "";
    return new Date(str).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const processedStudents = (() => {
    let res = [...students];
    const pass = Number(totalMarks) * 0.33;
    if (listFilter === "passed") res = res.filter(s => (Number(marks[s._id]) || 0) >= pass);
    if (listFilter === "failed") res = res.filter(s => (Number(marks[s._id]) || 0) < pass);
    if (listFilter === "highest") res.sort((a, b) => (Number(marks[b._id]) || 0) - (Number(marks[a._id]) || 0));
    else if (listFilter === "lowest") res.sort((a, b) => (Number(marks[a._id]) || 0) - (Number(marks[b._id]) || 0));
    return res;
  })();

  const classAvg = Object.values(marks).length > 0 ? (Object.values(marks).reduce((a, b) => a + Number(b), 0) / Object.values(marks).length).toFixed(1) : 0;

  return (
    // Fixed: Adjusted responsive padding
    <div className="h-full flex flex-col font-sans text-slate-800 p-4 sm:p-6 lg:p-8 overflow-hidden relative bg-white">
      
      {/* EXPORT MODAL */}
      {showExportModal && (
        // Fixed: Corrected invalid z-999 to z-[100]
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50">
              <h3 className="font-black text-xs uppercase tracking-widest text-slate-700">Confirm Export</h3>
              <button onClick={() => setShowExportModal(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <button onClick={exportPDF} className="flex flex-col items-center gap-3 p-4 rounded-xl border border-slate-100 hover:bg-slate-50 group transition-all">
                <FileText size={20} className="text-rose-600 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase">PDF</span>
              </button>
              <button onClick={exportExcel} className="flex flex-col items-center gap-3 p-4 rounded-xl border border-slate-100 hover:bg-slate-50 group transition-all">
                <Table size={20} className="text-emerald-600 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase">Excel</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER BAR */}
      <div className="shrink-0 bg-white border border-slate-200 rounded-2xl mb-4 sm:mb-6 p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-3 sm:gap-4 w-full lg:w-auto">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center shrink-0">
              <ClipboardCheck size={20} className="sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold tracking-tight truncate">Examination Entry</h2>
              <p className="text-[10px] sm:text-xs text-slate-400 font-medium truncate">{activeSubject || "Select class"}</p>
            </div>
          </div>

          {/* Fixed: Inputs now stack on mobile and stretch full width */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <input 
              type="text" placeholder="Exam Name" disabled={isSubmitted} value={examName}
              onChange={(e) => setExamName(e.target.value)}
              className={`w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 sm:py-2 text-sm font-bold outline-none focus:border-indigo-500 transition-all ${isSubmitted ? 'text-slate-900 font-black bg-slate-100' : ''}`}
            />
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 w-full sm:w-auto">
              <span className="text-[10px] font-bold text-slate-400 mr-2 uppercase">Max</span>
              <input 
                type="number" disabled={isSubmitted} value={totalMarks}
                onChange={(e) => setTotalMarks(e.target.value)}
                className="w-full sm:w-16 bg-transparent py-2.5 sm:py-2 text-sm font-black outline-none"
              />
            </div>
            <select 
              disabled={isSubmitted} value={selectedClass} onChange={(e) => handleClassChange(e.target.value)}
              className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 sm:py-2 text-sm font-bold outline-none cursor-pointer"
            >
              <option value="">Choose Class</option>
              {assignedClasses.map((c, i) => (
                <option key={i} value={`${c.classGrade}|${c.section}|${c.subject}`}>{c.classGrade}-{c.section} ({c.subject})</option>
              ))}
            </select>
          </div>
        </div>

        {/* History Chips with Delete Button */}
        {pastExams.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-100">
            <History size={14} className="text-slate-400 mr-1 shrink-0" />
            <button onClick={resetToNewEntry} className="group flex items-center gap-1 text-[10px] font-bold px-3 py-1.5 sm:py-1 rounded-md border border-dashed border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition-colors">
              <Plus size={10} /> New Entry
            </button>
            {pastExams.map((exam) => (
              <div key={exam} className="group relative">
                <button
                  onClick={() => { setExamName(exam); setMarks({}); setIsSubmitted(false); }}
                  className={`text-[10px] font-bold pl-3 pr-8 py-1.5 sm:py-1 rounded-md border transition-all flex items-center gap-2 ${examName === exam ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'}`}
                >
                  {exam}
                </button>
                <button 
                  onClick={(e) => handleDeleteExam(e, exam)}
                  className={`absolute right-1 top-1/2 -translate-y-1/2 p-0.5 rounded-md hover:bg-rose-500 hover:text-white transition-colors ${examName === exam ? 'text-slate-400' : 'text-slate-300'}`}
                >
                  <X size={12} strokeWidth={3} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* STUDENT LIST */}
      {!selectedClass ? (
        <div className="flex-1 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center text-slate-400 p-8 text-center">
          <Layers size={40} className="mb-3 opacity-20 sm:w-12 sm:h-12" />
          <p className="text-xs sm:text-sm font-bold uppercase tracking-widest">Waiting for Selection</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-2">
          <div className="shrink-0 px-4 sm:px-6 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
            <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Records</span>
            <select value={listFilter} onChange={(e) => setListFilter(e.target.value)} className="text-[10px] sm:text-[11px] font-bold bg-transparent outline-none text-indigo-600 cursor-pointer">
              <option value="default">Default Sort</option>
              <option value="highest">High to Low</option>
              <option value="lowest">Low to High</option>
              <option value="passed">Passed Only</option>
              <option value="failed">Failed Only</option>
            </select>
          </div>

          {/* Fixed: Added overflow-x-auto to prevent table crushing on mobile */}
          <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar w-full">
            <table className="w-full text-left min-w-[500px]">
              <thead className="sticky top-0 bg-white border-b border-slate-100 z-10">
                <tr>
                  <th className="px-4 sm:px-8 py-3 sm:py-4 text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Roll No</th>
                  <th className="px-4 py-3 sm:py-4 text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Student Name</th>
                  <th className="px-4 sm:px-8 py-3 sm:py-4 text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right whitespace-nowrap">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan="3" className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-slate-300" /></td></tr>
                ) : processedStudents.map((s) => {
                  const val = marks[s._id];
                  const pass = (Number(val) / Number(totalMarks)) >= 0.33;
                  return (
                    <tr key={s._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-4 sm:px-8 py-3 sm:py-4 font-mono text-xs sm:text-sm text-slate-400 font-bold whitespace-nowrap">{s.rollNo}</td>
                      <td className="px-4 py-3 sm:py-4 font-bold text-sm text-slate-700 whitespace-nowrap">{s.name}</td>
                      <td className="px-4 sm:px-8 py-3 sm:py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-3 sm:gap-4">
                          {isSubmitted && (
                            <span className={`text-[9px] font-black uppercase px-2 py-1 rounded border shadow-sm ${pass ? 'text-emerald-700 border-emerald-200 bg-emerald-50' : 'text-rose-700 border-rose-200 bg-rose-50'}`}>
                              {pass ? 'Pass' : 'Fail'}
                            </span>
                          )}
                          <div className="relative flex items-center">
                            <input 
                              type="number" disabled={isSubmitted} value={val !== undefined ? val : ""}
                              onChange={(e) => handleMarkChange(s._id, e.target.value)}
                              className={`w-14 sm:w-16 py-1 text-center font-black text-sm outline-none border-b-2 transition-all ${isSubmitted ? 'text-slate-900 border-transparent bg-transparent opacity-100' : 'border-slate-100 focus:border-indigo-500'}`}
                            />
                            <span className={`text-[9px] sm:text-[10px] ml-1 font-bold ${isSubmitted ? 'text-slate-400' : 'text-slate-300'}`}>/ {totalMarks}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* FOOTER */}
          {/* Fixed: Buttons stack full width on mobile, row on tablet */}
          <div className="shrink-0 p-4 sm:p-5 bg-white border-t border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4 sm:gap-6 text-slate-400 w-full md:w-auto">
              <div className="flex flex-col">
                <span className="text-[9px] font-bold uppercase tracking-widest">Avg</span>
                <span className="text-sm font-black text-slate-800">{classAvg}%</span>
              </div>
              <div className="w-px h-6 bg-slate-100"></div>
              {isSubmitted && lastUpdated && (
                <div className="flex items-center gap-2 text-slate-500 font-bold">
                  <Clock size={12} className="shrink-0" />
                  <span className="text-[9px] font-black uppercase tracking-widest">{formatDateTime(lastUpdated)}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              {isSubmitted ? (
                <>
                  <button onClick={() => setShowExportModal(true)} className="flex items-center justify-center gap-2 text-slate-700 px-4 py-2.5 sm:py-2 text-xs font-black border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors w-full sm:w-auto">
                    <Download size={14} /> EXPORT
                  </button>
                  <div className="flex items-center justify-center gap-2 text-slate-900 px-4 py-2.5 sm:py-2 text-xs font-black border-2 rounded-lg bg-white border-slate-900/10 w-full sm:w-auto">
                    <LockIcon size={14} /> PUBLISHED
                  </div>
                  <button onClick={() => setIsSubmitted(false)} className="flex items-center justify-center gap-2 text-indigo-600 px-4 py-2.5 sm:py-2 text-xs font-black hover:bg-indigo-50 rounded-lg transition-colors w-full sm:w-auto">
                    <Unlock size={14} /> EDIT
                  </button>
                </>
              ) : (
                <button onClick={handleSubmit} disabled={!examName.trim() || loading} className="w-full sm:w-auto bg-slate-900 text-white px-8 py-3 rounded-lg text-xs font-black hover:bg-black transition-all flex items-center justify-center gap-2 disabled:bg-slate-200 shadow-xl">
                  {loading ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                  PUBLISH RESULTS
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #e2e8f0; border-radius: 10px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}} />
    </div>
  );
}