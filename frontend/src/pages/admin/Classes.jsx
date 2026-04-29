import { useEffect, useState } from "react";
import { getClasses, createClass, deleteClass, getStudentsByClass } from "../../api/adminApi";
import { Plus, Trash2, Layers, Users, X, User, Search, Loader2 } from "lucide-react";

export default function Classes() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Create Class Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClassName, setNewClassName] = useState("");

  // View Students Modal
  const [viewingClass, setViewingClass] = useState(null); 
  const [classStudents, setClassStudents] = useState([]); 
  const [loadingStudents, setLoadingStudents] = useState(false);
  
  // --- NEW SEARCH STATE ---
  const [studentSearch, setStudentSearch] = useState("");

  // Fetch Classes
  const fetchClasses = async () => {
    try {
      const res = await getClasses();
      setClasses(res.data);
    } catch (err) {
      console.error("Error fetching classes", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  // --- HANDLE VIEW CLASS ---
  const handleViewClass = async (className) => {
    setViewingClass(className);
    setLoadingStudents(true);
    setStudentSearch(""); // Reset search when opening
    try {
      const res = await getStudentsByClass(className);
      setClassStudents(res.data);
    } catch (err) {
      alert("Failed to load students. Ensure backend is running and updated.");
      console.error(err);
    } finally {
      setLoadingStudents(false);
    }
  };

  const closeViewModal = () => {
    setViewingClass(null);
    setClassStudents([]);
  };

  // --- FILTER LOGIC ---
  const filteredStudents = classStudents.filter(s => 
    s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.rollNo.toString().includes(studentSearch)
  );

  // Handle Create
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createClass({ name: newClassName });
      setNewClassName(""); 
      setIsModalOpen(false); 
      fetchClasses(); 
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create class");
    }
  };

  // Handle Delete
  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Are you sure? This will unlink students from this class.")) {
      try {
        await deleteClass(id);
        fetchClasses();
      } catch (err) {
        alert("Failed to delete class");
      }
    }
  };

  return (
    // Fixed: Added wrapper padding for mobile screens
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 font-sans">
      
      {/* Fixed: Stacked header for mobile, full-width button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Class Management</h2>
          <p className="text-sm text-gray-500 mt-1">Create and manage academic classes</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto justify-center bg-indigo-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-sm font-medium text-sm"
        >
          <Plus size={18} /> Add Class
        </button>
      </div>

      {/* --- CLASSES GRID --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {!loading && classes.length === 0 && (
          <div className="col-span-1 sm:col-span-2 lg:col-span-3 text-center py-12 bg-white rounded-xl shadow-sm border border-dashed border-gray-300">
            <Layers size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No classes found.</p>
            <p className="text-sm text-gray-400">Create your first class to get started.</p>
          </div>
        )}

        {classes.map((cls) => (
          <div 
            key={cls._id} 
            onClick={() => handleViewClass(cls.name)}
            // Fixed: Adjusted padding for mobile
            className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md hover:border-indigo-100 transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-indigo-50 p-2.5 sm:p-3 rounded-lg text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors shrink-0">
                <Layers size={20} className="sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-gray-800 text-base sm:text-lg truncate">Class {cls.name}</h3>
                <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 mt-1">
                  <Users size={14} className="shrink-0" />
                  <span className="truncate">{cls.studentCount || 0} Students</span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={(e) => handleDelete(e, cls._id)}
              className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all shrink-0 ml-2"
              title="Delete Class"
            >
              <Trash2 size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>
        ))}
      </div>

      {/* --- 1. ADD CLASS MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-[100] backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <h3 className="text-xl font-bold mb-6 text-gray-800">Add New Class</h3>
            <form onSubmit={handleCreate}>
              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Class Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. 10"
                  className="w-full border border-gray-300 p-3 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  required
                />
              </div>
              {/* Fixed: Buttons stretch full width and reverse order on mobile */}
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto px-5 py-2.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold transition-colors">Cancel</button>
                <button type="submit" className="w-full sm:w-auto px-6 py-2.5 text-sm bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-sm font-bold transition-colors">Create Class</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- 2. VIEW STUDENTS MODAL (UPDATED) --- */}
      {viewingClass && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200">
          
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 max-w-2xl w-full p-0 overflow-hidden relative flex flex-col h-[85vh] sm:h-[80vh] animate-in zoom-in-95 duration-200">
            
            {/* Header (Fixed at top) */}
            {/* Fixed: Adjusted padding and header layout for small screens */}
            <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50 space-y-4">
              <div className="flex justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800">Class {viewingClass} Students</h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Total Students: {classStudents.length}</p>
                </div>
                <button onClick={closeViewModal} className="text-gray-400 hover:text-gray-600 p-1.5 bg-white sm:bg-transparent border sm:border-none border-gray-200 hover:bg-gray-200 rounded-full transition-colors shrink-0">
                  <X size={20} className="sm:w-6 sm:h-6" />
                </button>
              </div>

              {/* SEARCH BAR */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search by Name or Roll No..." 
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                />
              </div>
            </div>

            {/* List Content (Scrollable Area) */}
            <div className="p-0 overflow-y-auto flex-1 bg-white custom-scrollbar w-full">
              {loadingStudents ? (
                <div className="p-12 text-center text-gray-500 flex flex-col items-center text-sm">
                  <Loader2 className="animate-spin mb-2" size={24} />
                  Loading students...
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center text-gray-400">
                  <User size={40} className="mb-3 opacity-20 sm:w-12 sm:h-12" />
                  <p className="text-sm">{studentSearch ? "No matching students found." : "No students in this class."}</p>
                </div>
              ) : (
                // Fixed: Added overflow-x-auto and min-width to prevent table crushing on mobile
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left min-w-[450px]">
                    <thead className="bg-gray-50/90 backdrop-blur-sm sticky top-0 shadow-sm z-10">
                      <tr>
                        <th className="p-4 text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider w-20 sm:w-24 whitespace-nowrap">Roll No</th>
                        <th className="p-4 text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Name</th>
                        <th className="p-4 text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider w-20 sm:w-24 whitespace-nowrap">Section</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredStudents.map((s) => (
                        <tr key={s._id} className="hover:bg-gray-50 transition-colors">
                          <td className="p-4 font-mono text-gray-600 text-xs sm:text-sm font-semibold whitespace-nowrap">{s.rollNo}</td>
                          <td className="p-4 font-medium text-gray-800 text-sm whitespace-nowrap">{s.name}</td>
                          <td className="p-4 whitespace-nowrap">
                            <span className="bg-indigo-50 text-indigo-700 px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold shadow-sm border border-indigo-100 inline-block">
                              {s.section}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Footer (Fixed at bottom) */}
            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <button onClick={closeViewModal} className="w-full sm:w-auto float-right px-6 py-2.5 bg-white border border-gray-200 shadow-sm text-gray-700 rounded-xl hover:bg-gray-50 font-bold text-sm transition-colors">
                Close
              </button>
              <div className="clear-both"></div>
            </div>
          </div>
        </div>
      )}

      {/* Added consistent scrollbar styling */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { height: 5px; width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #e2e8f0; border-radius: 10px; }
      `}} />
    </div>
  );
}