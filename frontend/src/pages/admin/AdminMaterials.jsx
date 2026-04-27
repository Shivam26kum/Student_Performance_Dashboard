import { useState, useEffect } from "react";
import api from "../../api/api";
import { 
  BookOpen, User, Eye, Trash2, 
  AlertCircle, Loader2, FileText, Search, X
} from "lucide-react";
import { useToaster } from "react-toastella";

export default function AdminMaterials() {
  const { notify } = useToaster();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // Stores the object of material to delete
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const { data } = await api.get("/api/admin/materials");
      setMaterials(data);
    } catch (err) {
      notify({ message: "Failed to load repository", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setIsDeleting(true);
    try {
      await api.delete(`/api/admin/materials/${deleteConfirm._id}`);
      notify({ message: "Material removed successfully", type: "success" });
      setMaterials(materials.filter((m) => m._id !== deleteConfirm._id));
      setDeleteConfirm(null);
    } catch (err) {
      notify({ message: "Action failed", type: "error" });
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return <PageSkeleton />;

  return (
    <div className="h-full flex flex-col p-8 overflow-hidden font-sans relative">
      
      {/* --- CONFIRMATION CARD OVERLAY --- */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-4">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">Delete Resource?</h3>
              <p className="text-sm text-gray-500 font-medium mb-8 leading-relaxed">
                Are you sure you want to remove <span className="text-gray-800 font-bold">"{deleteConfirm.title}"</span>? This cannot be undone.
              </p>
              <div className="flex gap-3 w-full">
                <button 
                  disabled={isDeleting}
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-3.5 rounded-2xl bg-gray-100 text-gray-600 font-bold text-sm hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  disabled={isDeleting}
                  onClick={handleDelete}
                  className="flex-1 py-3.5 rounded-2xl bg-rose-500 text-white font-bold text-sm hover:bg-rose-600 shadow-lg shadow-rose-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  {isDeleting ? <Loader2 size={16} className="animate-spin" /> : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <div className="shrink-0 flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Resource Repository</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Global oversight of all academic study materials.</p>
        </div>
        <div className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
          {materials.length} Files Total
        </div>
      </div>

      {/* --- CONTENT GRID --- */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-10">
        {materials.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {materials.map((file) => (
              <div key={file._id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-6 group hover:border-indigo-200 transition-all relative overflow-hidden">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
                  <FileText size={28} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-800 truncate pr-6">{file.title}</h4>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-tighter">
                      {file.subject} • {file.classGrade}-{file.section}
                    </span>
                    <div className="w-1 h-1 bg-gray-300 rounded-full hidden md:block" />
                    <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                      <User size={10} /> By {file.teacher?.name || "Faculty"}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                  <a 
                    href={file.fileUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                  >
                    <Eye size={18} />
                  </a>
                  <button 
                    onClick={() => setDeleteConfirm(file)}
                    className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-gray-400 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100">
            <BookOpen size={48} className="opacity-10 mb-4" />
            <p className="font-black text-xs uppercase tracking-widest">No materials found in repository</p>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #e2e8f0; border-radius: 10px; }
      `}} />
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="h-full flex flex-col p-8 overflow-hidden animate-pulse">
      <div className="h-12 w-64 bg-gray-200 rounded-xl mb-8" />
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-28 bg-gray-200 rounded-[2.5rem]" />
        ))}
      </div>
    </div>
  );
}