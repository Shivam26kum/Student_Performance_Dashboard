import { useState, useEffect } from "react";
// 👇 IMPORT getClasses & createStudent HERE
import { createStudent, getAllStudents, updateStudent, deleteStudent, getClasses } from "../../api/adminApi"; 
import { UserPlus, Search, GraduationCap, Loader2, Pencil, Trash2, X } from "lucide-react";

export default function AdminStudents() {
  const [students, setStudents] = useState([]); 
  const [classList, setClassList] = useState([]); // 👈 Store existing classes here
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Track if we are editing (null = creating, object = editing)
  const [editingStudent, setEditingStudent] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    rollNo: "",
    className: "", 
    section: ""
  });

  // --- 1. FETCH DATA (Students + Classes) ---
  const fetchData = async () => {
    try {
      setLoading(true);
      const [studentsRes, classesRes] = await Promise.all([
        getAllStudents(),
        getClasses()
      ]);
      
      setStudents(studentsRes.data);
      setClassList(classesRes.data); 
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- 2. HANDLERS ---
  const openAddModal = () => {
    setEditingStudent(null);
    setFormData({ name: "", rollNo: "", className: "", section: "" });
    setShowModal(true);
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      rollNo: student.rollNo,
      className: student.class, 
      section: student.section
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if(window.confirm("Are you sure you want to delete this student?")) {
      try {
        await deleteStudent(id);
        fetchData();
      } catch (err) {
        alert("Failed to delete");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        rollNo: formData.rollNo,
        class: formData.className, 
        section: formData.section
      };

      if (editingStudent) {
        await updateStudent(editingStudent._id, payload);
        alert("Student Updated Successfully!");
      } else {
        await createStudent(payload);
        alert("Student Added Successfully!");
      }
      
      setShowModal(false);
      fetchData(); 
    } catch (err) {
      console.error(err);
      alert("Operation failed: " + (err.response?.data?.message || "Server Error"));
    }
  };

  // --- 3. FILTER LOGIC ---
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNo.toString().includes(searchTerm)
  );

  return (
    // Fixed: Added wrapper padding for mobile screens
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 font-sans">
      
      {/* Header */}
      {/* Fixed: Stacked header for mobile, full width button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Student Directory</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all student records</p>
        </div>
        <button 
          onClick={openAddModal}
          className="w-full sm:w-auto justify-center bg-indigo-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-indigo-700 shadow-sm transition-colors font-medium text-sm"
        >
          <UserPlus size={18} /> Add Student
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or roll number..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>
      </div>

      {/* --- STUDENT LIST TABLE --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center items-center text-gray-500 text-sm">
            <Loader2 className="animate-spin mr-2" size={18} /> Loading records...
          </div>
        ) : filteredStudents.length > 0 ? (
          // Fixed: Custom scrollbar wrapper with min-width on table to prevent squeezing
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Roll No</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Name</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Class</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Section</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStudents.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-sm font-mono text-gray-600 whitespace-nowrap">{student.rollNo}</td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
                          {student.name.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-800">{student.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600 whitespace-nowrap">Class {student.class}</td>
                    <td className="p-4 text-sm text-gray-600 whitespace-nowrap">{student.section}</td>
                    <td className="p-4 text-right flex justify-end gap-2 whitespace-nowrap">
                      <button 
                        onClick={() => handleEdit(student)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(student._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
              <GraduationCap size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">No Students Found</h3>
            <p className="text-gray-500 mt-1 text-sm">
              {searchTerm ? "Try adjusting your search terms." : "Get started by adding a new student."}
            </p>
          </div>
        )}
      </div>

      {/* --- MODAL (CREATE & EDIT) --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-[100] backdrop-blur-sm transition-opacity">
          {/* Fixed: max-h for small devices and scrollable form body */}
          <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl transform transition-all scale-100 relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            
            <button 
              onClick={() => setShowModal(false)} 
              className="absolute right-4 top-4 p-2 bg-gray-50 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={18} />
            </button>

            <div className="mb-6 pr-8">
              <h3 className="text-xl font-bold text-gray-800">
                {editingStudent ? "Edit Student" : "Register New Student"}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Full Name</label>
                <input 
                  type="text" required 
                  className="w-full border border-gray-300 p-3 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. John Doe"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Roll Number</label>
                <input 
                  type="text" required 
                  className="w-full border border-gray-300 p-3 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  value={formData.rollNo}
                  onChange={(e) => setFormData({...formData, rollNo: e.target.value})}
                  placeholder="e.g. 101"
                />
              </div>

              {/* Fixed: Stacks to 1 column on tiny screens, 2 columns on small screens and up */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Class</label>
                  <select
                    required
                    className="w-full border border-gray-300 p-3 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-white cursor-pointer"
                    value={formData.className}
                    onChange={(e) => setFormData({...formData, className: e.target.value})}
                  >
                    <option value="">Select Class</option>
                    {classList.map((cls) => (
                      <option key={cls._id} value={cls.name}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Section</label>
                  <input 
                    type="text" required placeholder="e.g. A"
                    className="w-full border border-gray-300 p-3 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    value={formData.section}
                    onChange={(e) => setFormData({...formData, section: e.target.value})}
                  />
                </div>
              </div>

              {/* Fixed: Buttons stretch full width and reverse order on mobile */}
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 mt-2 border-t border-gray-50">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="w-full sm:w-auto px-5 py-2.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="w-full sm:w-auto px-6 py-2.5 text-sm bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold shadow-sm transition-colors"
                >
                  {editingStudent ? "Update Student" : "Save Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Added consistent scrollbar styling */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #e2e8f0; border-radius: 10px; }
      `}} />
    </div>
  );
}