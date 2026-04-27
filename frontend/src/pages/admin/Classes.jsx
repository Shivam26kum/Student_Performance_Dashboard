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
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Class Management</h2>
          <p className="text-gray-500 text-sm">Create and manage academic classes</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-sm font-medium"
        >
          <Plus size={20} /> Add Class
        </button>
      </div>

      {/* --- CLASSES GRID --- */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {!loading && classes.length === 0 && (
          <div className="col-span-3 text-center py-12 bg-white rounded-xl shadow-sm border border-dashed border-gray-300">
            <Layers size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No classes found.</p>
            <p className="text-sm text-gray-400">Create your first class to get started.</p>
          </div>
        )}

        {classes.map((cls) => (
          <div 
            key={cls._id} 
            onClick={() => handleViewClass(cls.name)}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md hover:border-indigo-100 transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="bg-indigo-50 p-3 rounded-lg text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Layers size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg">Class {cls.name}</h3>
                <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
                  <Users size={14} />
                  <span>{cls.studentCount || 0} Students</span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={(e) => handleDelete(e, cls._id)}
              className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all"
              title="Delete Class"
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>

      {/* --- 1. ADD CLASS MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Add New Class</h3>
            <form onSubmit={handleCreate}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Class Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. 10"
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm font-medium">Create Class</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- 2. VIEW STUDENTS MODAL (UPDATED) --- */}
      {viewingClass && (
        // 1. Transparent Background + Blur
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          
          {/* 2. Fixed Card Size: Changed 'max-h-[85vh]' to 'h-[80vh]' */}
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-2xl w-full p-0 overflow-hidden relative flex flex-col h-[80vh]">
            
            {/* Header (Fixed at top) */}
            <div className="p-6 border-b border-gray-100 bg-gray-50 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Class {viewingClass} Students</h3>
                  <p className="text-sm text-gray-500">Total Students: {classStudents.length}</p>
                </div>
                <button onClick={closeViewModal} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-200 rounded-full transition">
                  <X size={24} />
                </button>
              </div>

              {/* SEARCH BAR */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search by Name or Roll No..." 
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                />
              </div>
            </div>

            {/* List Content (Scrollable Area) */}
            {/* flex-1 ensures it fills the remaining height. overflow-y-auto enables scrolling ONLY here */}
            <div className="p-0 overflow-y-auto flex-1 bg-white">
              {loadingStudents ? (
                <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                  <Loader2 className="animate-spin mb-2" />
                  Loading students...
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center text-gray-400">
                  <User size={48} className="mb-2 opacity-20" />
                  <p>{studentSearch ? "No matching students found." : "No students in this class."}</p>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-gray-50 sticky top-0 shadow-sm">
                    <tr>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-24">Roll No</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-24">Section</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredStudents.map((s) => (
                      <tr key={s._id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-mono text-gray-600 text-sm font-semibold">{s.rollNo}</td>
                        <td className="p-4 font-medium text-gray-800">{s.name}</td>
                        <td className="p-4">
                          <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold shadow-sm border border-indigo-200">
                            {s.section}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Footer (Fixed at bottom) */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 text-right">
              <button onClick={closeViewModal} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}