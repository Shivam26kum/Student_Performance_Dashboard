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
    <div className="h-full flex flex-col max-w-6xl mx-auto overflow-hidden p-4 font-sans">
      {/* HEADER */}
      <div className="shrink-0 bg-white p-6 rounded-xl shadow-sm mb-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FileText className="text-blue-600" size={24} /> Study Materials
          </h2>
          <p className="text-sm text-gray-500 font-medium">Manage academic resources for your students.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 active:scale-95"
        >
          <Plus size={20} /> Upload New
        </button>
      </div>

      {/* GRID LIST */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-4">
        {materials.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {materials.map((file) => (
              <div key={file._id} className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-all group relative border border-transparent hover:border-emerald-100">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <FileText size={24} />
                </div>
                <div className="absolute top-5 right-5 px-2 py-1 bg-gray-100 rounded text-[10px] font-black text-gray-500 uppercase">
                  {file.type}
                </div>
                <h3 className="font-bold text-gray-800 truncate pr-10">{file.title}</h3>
                <p className="text-[10px] font-bold text-emerald-600 uppercase mt-1">
                  Class {file.classGrade}-{file.section} • {file.subject}
                </p>
                <p className="text-xs text-gray-400 mt-2 line-clamp-1 italic">{file.description || "No description provided."}</p>
                
                <div className="flex gap-2 mt-6 pt-4 border-t border-gray-50">
                  <a 
                    href={file.fileUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex-1 bg-gray-50 text-gray-600 py-2 rounded-lg text-xs font-bold hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center gap-2 transition-colors"
                  >
                    <Download size={14} /> View / Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-gray-400 bg-white rounded-2xl shadow-sm border-2 border-dashed border-gray-100">
            <FileText size={48} className="opacity-10 mb-2" />
            <p className="font-bold">No materials uploaded yet</p>
          </div>
        )}
      </div>

      {/* UPLOAD MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-800">Upload Study Material</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full text-gray-400 hover:text-rose-500 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpload} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Document Title</label>
                <input 
                  required
                  className="w-full bg-gray-50 border-none rounded-xl p-3 mt-1 text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="e.g. Chapter 5 Physics Notes"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Target Class</label>
                  <select 
                    required
                    className="w-full bg-gray-50 border-none rounded-xl p-3 mt-1 text-sm font-semibold outline-none"
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
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">File Type</label>
                  <select 
                    className="w-full bg-gray-50 border-none rounded-xl p-3 mt-1 text-sm font-semibold outline-none"
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
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">File URL / Cloud Link</label>
                <div className="relative mt-1">
                  <div className="absolute left-3 top-3 text-gray-400"><LinkIcon size={16} /></div>
                  <input 
                    required
                    className="w-full bg-gray-50 border-none rounded-xl p-3 pl-10 text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="https://drive.google.com/..."
                    value={formData.fileUrl}
                    onChange={(e) => setFormData({...formData, fileUrl: e.target.value})}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={uploading}
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold mt-4 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-emerald-100"
              >
                {uploading ? <Loader2 className="animate-spin" size={20} /> : "Publish Material"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="max-w-6xl mx-auto p-4 animate-pulse h-full flex flex-col gap-4">
      <div className="shrink-0 h-24 bg-gray-200 rounded-xl"></div>
      <div className="grid grid-cols-3 gap-4">
        {[1,2,3].map(i => <div key={i} className="h-48 bg-gray-200 rounded-2xl"></div>)}
      </div>
    </div>
  );
}