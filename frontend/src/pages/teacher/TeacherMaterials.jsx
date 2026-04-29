import { useState, useEffect } from "react";
import { getStudyMaterials, uploadMaterial, getMyClasses } from "../../api/teacherApi";
import { FileText, Trash2, Plus, X, Loader2, Link as LinkIcon, Download } from "lucide-react";
import { useToaster } from "react-toastella";

export default function TeacherMaterials() {
  const { notify } = useToaster();
  const [materials, setMaterials] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    fileUrl: "",
    type: "PDF",
    classGrade: "",
    section: "",
    subject: ""
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [materialsRes, classesRes] = await Promise.all([
        getStudyMaterials(),
        getMyClasses()
      ]);
      setMaterials(materialsRes.data);
      setClasses(classesRes.data);
    } catch (err) {
      notify({ message: "Failed to load materials", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!formData.classGrade || !formData.fileUrl) {
      return notify({ message: "Please fill required fields", type: "error" });
    }

    setUploading(true);
    try {
      await uploadMaterial(formData);
      notify({ message: "Material uploaded successfully!", type: "success" });
      setIsModalOpen(false);
      setFormData({ title: "", description: "", fileUrl: "", type: "PDF", classGrade: "", section: "", subject: "" });
      fetchInitialData(); // Refresh list
    } catch (err) {
      notify({ message: "Upload failed", type: "error" });
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <PageSkeleton />;

  return (
    // Fixed: Added responsive padding to the main wrapper
    <div className="h-full flex flex-col max-w-6xl mx-auto overflow-hidden p-4 sm:p-6 lg:p-8 font-sans">
      
      {/* HEADER */}
      {/* Fixed: Header stacks on mobile, button takes full width */}
      <div className="shrink-0 bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2 sm:gap-3">
            <FileText className="text-blue-600 sm:w-7 sm:h-7" size={24} /> Study Materials
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">Manage academic resources for your students.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto justify-center bg-emerald-600 text-white px-5 py-3 sm:py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 active:scale-95 text-sm sm:text-base"
        >
          <Plus size={20} className="sm:w-5 sm:h-5" /> Upload New
        </button>
      </div>

      {/* GRID LIST */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-4 pr-1 sm:pr-2">
        {materials.length > 0 ? (
          // Fixed: Adjusted grid gaps for mobile
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {materials.map((file) => (
              <div key={file._id} className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm hover:shadow-md transition-all group relative border border-gray-100 hover:border-emerald-200 flex flex-col h-full">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-3 sm:mb-4 shrink-0">
                  <FileText size={20} className="sm:w-6 sm:h-6" />
                </div>
                <div className="absolute top-4 sm:top-5 right-4 sm:right-5 px-2.5 py-1 bg-gray-50 border border-gray-100 rounded-md text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  {file.type}
                </div>
                <h3 className="font-bold text-gray-800 text-base sm:text-lg truncate pr-12">{file.title}</h3>
                <p className="text-[9px] sm:text-[10px] font-black text-emerald-600 uppercase mt-1 tracking-wider">
                  Class {file.classGrade}-{file.section} <span className="text-gray-300 mx-1">•</span> {file.subject}
                </p>
                <p className="text-xs text-gray-500 mt-2.5 sm:mt-3 line-clamp-2 leading-relaxed flex-1">{file.description || <span className="italic opacity-60">No description provided.</span>}</p>
                
                <div className="flex gap-2 mt-5 sm:mt-6 pt-4 border-t border-gray-50 shrink-0">
                  <a 
                    href={file.fileUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex-1 bg-gray-50 border border-gray-100 text-gray-600 py-2.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 flex items-center justify-center gap-2 transition-all"
                  >
                    <Download size={16} className="sm:w-4 sm:h-4" /> View / Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-64 sm:h-full flex flex-col items-center justify-center text-gray-400 bg-white rounded-[2rem] shadow-sm border-2 border-dashed border-gray-100 p-6 text-center">
            <FileText size={48} className="opacity-20 mb-3 sm:mb-4 sm:w-16 sm:h-16" />
            <p className="font-bold text-sm sm:text-base uppercase tracking-widest">No materials uploaded yet</p>
          </div>
        )}
      </div>

      {/* UPLOAD MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          {/* Fixed: Added max-h-[90vh] and overflow-y-auto to prevent cutoff on small screens */}
          <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-lg shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
              <h3 className="text-base sm:text-lg font-bold text-gray-800">Upload Study Material</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white border border-gray-200 hover:bg-gray-100 rounded-full text-gray-400 hover:text-rose-500 transition-colors shadow-sm">
                <X size={18} className="sm:w-5 sm:h-5" />
              </button>
            </div>
            
            {/* Form body scrolls independently of header/footer if screen is too short */}
            <div className="overflow-y-auto custom-scrollbar p-5 sm:p-6">
              <form id="upload-form" onSubmit={handleUpload} className="space-y-4 sm:space-y-5">
                <div>
                  <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Document Title</label>
                  <input 
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 sm:p-3.5 mt-1.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
                    placeholder="e.g. Chapter 5 Physics Notes"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>

                {/* Fixed: Stacks vertically on mobile, side-by-side on sm+ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Target Class</label>
                    <select 
                      required
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 sm:p-3.5 mt-1.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all cursor-pointer"
                      value={`${formData.classGrade}-${formData.section}-${formData.subject}`}
                      onChange={(e) => {
                        const [g, s, sub] = e.target.value.split("-");
                        setFormData({...formData, classGrade: g, section: s, subject: sub});
                      }}
                    >
                      <option value="">Select Class</option>
                      {classes.map((c, i) => (
                        <option key={i} value={`${c.classGrade}-${c.section}-${c.subject}`}>
                          {c.classGrade}-{c.section} ({c.subject})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">File Type</label>
                    <select 
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 sm:p-3.5 mt-1.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all cursor-pointer"
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                    >
                      <option value="PDF">PDF Document</option>
                      <option value="Image">Image / Diagram</option>
                      <option value="Docx">Word File</option>
                      <option value="Link">External Link</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">File URL / Cloud Link</label>
                  <div className="relative mt-1.5">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"><LinkIcon size={16} className="sm:w-[18px] sm:h-[18px]" /></div>
                    <input 
                      required
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 sm:p-3.5 pl-10 sm:pl-11 text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
                      placeholder="https://drive.google.com/..."
                      value={formData.fileUrl}
                      onChange={(e) => setFormData({...formData, fileUrl: e.target.value})}
                    />
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-4 sm:p-6 border-t border-gray-100 bg-white shrink-0">
              <button 
                form="upload-form"
                type="submit" 
                disabled={uploading}
                className="w-full bg-emerald-600 text-white py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-emerald-100 active:scale-95 text-sm sm:text-base"
              >
                {uploading ? <Loader2 className="animate-spin" size={20} /> : "Publish Material"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #e2e8f0; border-radius: 10px; }
        @media (min-width: 640px) {
          .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        }
      `}} />
    </div>
  );
}

function PageSkeleton() {
  return (
    // Fixed: Matches responsive padding and grid setup
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 animate-pulse h-full flex flex-col gap-4 sm:gap-6 w-full">
      <div className="shrink-0 h-24 sm:h-28 bg-gray-200 rounded-2xl w-full"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {[1,2,3,4,5,6].map(i => <div key={i} className="h-40 sm:h-48 bg-gray-200 rounded-2xl w-full"></div>)}
      </div>
    </div>
  );
}