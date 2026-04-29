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
  const [deleteConfirm, setDeleteConfirm] = useState(null);
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
    // Fixed: Adjusted padding for mobile responsiveness
    <div className="h-full flex flex-col p-4 sm:p-6 md:p-8 overflow-hidden font-sans relative">
      
      {/* --- CONFIRMATION CARD OVERLAY --- */}
      {deleteConfirm && (
        // Fixed: Changed invalid z-100 to z-[100]
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-4 shrink-0">
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
                  className="flex-1 py-3 sm:py-3.5 rounded-2xl bg-gray-100 text-gray-600 font-bold text-sm hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  disabled={isDeleting}
                  onClick={handleDelete}
                  className="flex-1 py-3 sm:py-3.5 rounded-2xl bg-rose-500 text-white font-bold text-sm hover:bg-rose-600 shadow-lg shadow-rose-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  {isDeleting ? <Loader2 size={16} className="animate-spin" /> : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- HEADER --- */}
      {/* Fixed: Stacked header on mobile to prevent overlapping */}
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-gray-800">Resource Repository</h1>
          <p className="text-xs md:text-sm text-gray-500 font-medium mt-1">Global oversight of all academic study materials.</p>
        </div>
        <div className="w-fit bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest self-start sm:self-auto">
          {materials.length} Files Total
        </div>
      </div>

      {/* --- CONTENT GRID --- */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 md:pr-2 pb-10">
        {materials.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {materials.map((file) => (
              // Fixed: Adjusted card padding, gaps, and border radius for mobile
              <div key={file._id} className="bg-white p-4 sm:p-5 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-3 sm:gap-4 md:gap-6 group hover:border-indigo-200 transition-all relative overflow-hidden">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-indigo-50 text-indigo-600 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6 md:w-7 md:h-7" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-800 text-sm md:text-base truncate pr-2 md:pr-6">{file.title}</h4>
                  <div className="flex flex-wrap items-center gap-x-2 md:gap-x-3 gap-y-1 mt-1">
                    <span className="text-[9px] md:text-[10px] font-black text-indigo-500 uppercase tracking-tighter">
                      {file.subject} • {file.classGrade}-{file.section}
                    </span>
                    <div className="w-1 h-1 bg-gray-300 rounded-full hidden sm:block" />
                    <span className="text-[9px] md:text-[10px] font-bold text-gray-400 flex items-center gap-1">
                      <User size={10} /> By {file.teacher?.name || "Faculty"}
                    </span>
                  </div>
                </div>

                {/* Fixed CRITICAL Mobile Issue: Always visible on mobile (opacity-100 lg:opacity-0) so users can tap them */}
                <div className="flex gap-1.5 md:gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all transform translate-x-0 lg:translate-x-4 lg:group-hover:translate-x-0 shrink-0">
                  <a 
                    href={file.fileUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-2.5 md:p-3 bg-gray-50 text-gray-400 rounded-lg md:rounded-xl hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                  >
                    <Eye size={16} className="md:w-[18px] md:h-[18px]" />
                  </a>
                  <button 
                    onClick={() => setDeleteConfirm(file)}
                    className="p-2.5 md:p-3 bg-gray-50 text-gray-400 rounded-lg md:rounded-xl hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 size={16} className="md:w-[18px] md:h-[18px]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-gray-400 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100">
            <BookOpen size={48} className="opacity-10 mb-4" />
            <p className="font-black text-xs uppercase tracking-widest text-center px-4">No materials found in repository</p>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #e2e8f0; border-radius: 10px; }
        @media (min-width: 768px) {
          .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        }
      `}} />
    </div>
  );
}

function PageSkeleton() {
  return (
    // Fixed: Skeleton margins and grid matches real component
    <div className="h-full flex flex-col p-4 sm:p-6 md:p-8 overflow-hidden animate-pulse">
      <div className="h-10 md:h-12 w-48 md:w-64 bg-gray-200 rounded-xl mb-6 md:mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-24 md:h-28 bg-gray-200 rounded-[1.5rem] md:rounded-[2.5rem]" />
        ))}
      </div>
    </div>
  );
}