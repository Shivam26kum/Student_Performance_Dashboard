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
  // Using 'className' to avoid React keyword conflict, mapped to 'class' on submit
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
      // Fetch both Students and Classes simultaneously
      const [studentsRes, classesRes] = await Promise.all([
        getAllStudents(),
        getClasses()
      ]);
      
      setStudents(studentsRes.data);
      setClassList(classesRes.data); // Store classes for the dropdown
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
      // Prepare payload: Map 'className' state to 'class' for Backend
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
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Student Directory</h1>
          <p className="text-gray-500">Manage all student records</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 shadow-sm transition-colors"
        >
          <UserPlus size={20} /> Add Student
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by name or roll number..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
          />
        </div>
      </div>

      {/* --- STUDENT LIST TABLE --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center items-center text-gray-500">
            <Loader2 className="animate-spin mr-2" /> Loading records...
          </div>
        ) : filteredStudents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Roll No</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Class</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Section</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStudents.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-sm font-mono text-gray-600">{student.rollNo}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                          {student.name.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-800">{student.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{student.class}</td>
                    <td className="p-4 text-sm text-gray-600">{student.section}</td>
                    <td className="p-4 text-right flex justify-end gap-2">
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
            <p className="text-gray-500 mt-1">
              {searchTerm ? "Try adjusting your search terms." : "Get started by adding a new student."}
            </p>
          </div>
        )}
      </div>

      {/* --- MODAL (CREATE & EDIT) --- */}
      {showModal && (
        <div className="fixed inset-0 bg-transparent bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm transition-opacity">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl transform transition-all scale-100 relative">
            
            <button 
              onClick={() => setShowModal(false)} 
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>

            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                {editingStudent ? "Edit Student" : "Register New Student"}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" required 
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
                <input 
                  type="text" required 
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  value={formData.rollNo}
                  onChange={(e) => setFormData({...formData, rollNo: e.target.value})}
                  placeholder="e.g. 101"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                  <select
                    required
                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                  <input 
                    type="text" required placeholder="e.g. A"
                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    value={formData.section}
                    onChange={(e) => setFormData({...formData, section: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm transition-colors"
                >
                  {editingStudent ? "Update Student" : "Save Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}