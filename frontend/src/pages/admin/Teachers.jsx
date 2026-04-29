import { useEffect, useState } from "react";
import {
  getAllTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} from "../../api/adminApi";
import {
  Plus,
  User,
  Mail,
  Lock,
  Pencil,
  Trash2,
  X,
  Search,
  Loader2,
  Phone,
  BookOpen,
  Layers,
  Eye,
  EyeOff,
  PlusCircle,
  MinusCircle
} from "lucide-react";
import { useToaster } from "react-toastella";

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { notify } = useToaster();

  // --- 1. FORM STATE (Using assignedClasses Array) ---
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    assignedClasses: [] // Stores multiple classes
  });

  // --- 2. TEMP STATE FOR ADDING CLASS ---
  const [tempClass, setTempClass] = useState({
    classGrade: "",
    section: "",
    subject: ""
  });

  // --- FETCH DATA ---
  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const res = await getAllTeachers();
      setTeachers(res.data);
    } catch (err) {
      console.error("Failed to fetch teachers", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  // --- MODAL HANDLERS ---
  const openAddModal = () => {
    setEditingTeacher(null);
    setFormData({ name: "", email: "", password: "", phone: "", assignedClasses: [] });
    setTempClass({ classGrade: "", section: "", subject: "" });
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const openEditModal = (teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name,
      email: teacher.email,
      password: "",
      phone: teacher.phone || "",
      // Important: Load existing assignments or empty array
      assignedClasses: teacher.assignedClasses || [] 
    });
    setTempClass({ classGrade: "", section: "", subject: "" });
    setShowPassword(false);
    setIsModalOpen(true);
  };

  // --- CLASS LIST LOGIC ---
  const addClassToList = () => {
    if (!tempClass.classGrade || !tempClass.section || !tempClass.subject) {
      alert("Please fill Class, Section, and Subject.");
      return;
    }
    // Add to formData state
    setFormData({
      ...formData,
      assignedClasses: [...formData.assignedClasses, tempClass]
    });
    // Clear input fields
    setTempClass({ classGrade: "", section: "", subject: "" });
  };

  const removeClassFromList = (index) => {
    const updatedList = formData.assignedClasses.filter((_, i) => i !== index);
    setFormData({ ...formData, assignedClasses: updatedList });
  };

  // --- API ACTIONS ---
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this teacher?")) {
      try {
        await deleteTeacher(id);
        fetchTeachers();
        notify({ message: "Teacher deleted successfully!", type: "success" });
      } catch (err) {
        notify({ message: "Failed to delete teacher!", type: "error" });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
        alert("Name and Email are required.");
        return;
    }

    try {
      if (editingTeacher) {
        const dataToSend = { ...formData };
        // Don't send empty password on update
        if (!dataToSend.password) delete dataToSend.password;
        
        await updateTeacher(editingTeacher._id, dataToSend);
        notify({ message: "Teacher updated successfully!", type: "success" });
      } else {
        await createTeacher(formData);
        notify({ message: "Teacher created successfully!", type: "success" });
      }
      setIsModalOpen(false);
      fetchTeachers();
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed");
    }
  };

  const filteredTeachers = teachers.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    // Fixed: Added wrapper padding for mobile screens
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 font-sans">
      
      {/* HEADER */}
      {/* Fixed: Stacked header for mobile, full-width button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Teacher Directory</h2>
          <p className="text-sm text-gray-500 mt-1">Manage faculty, assignments, and subjects</p>
        </div>
        <button
          onClick={openAddModal}
          className="w-full sm:w-auto justify-center bg-indigo-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-sm font-medium text-sm"
        >
          <Plus size={18} /> Add Teacher
        </button>
      </div>

      {/* SEARCH */}
      <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center items-center text-gray-500 text-sm">
            <Loader2 className="animate-spin mr-2" size={18} /> Loading records...
          </div>
        ) : filteredTeachers.length > 0 ? (
          // Fixed: Custom scrollbar wrapper with min-width on table to prevent squeezing
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Profile</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Contact Info</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Assignments</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTeachers.map((t) => (
                  <tr key={t._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 flex items-center gap-3 whitespace-nowrap">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold shrink-0">
                        {t.name.charAt(0)}
                      </div>
                      <div>
                          <span className="block font-medium text-gray-800">{t.name}</span>
                          <span className="text-xs text-gray-500">ID: {t._id.slice(-4)}</span>
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                        <div className="flex flex-col text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                                <Mail size={14} className="text-gray-400 shrink-0"/> {t.email}
                            </div>
                            <div className="flex items-center gap-2 mt-1.5">
                                <Phone size={14} className="text-gray-400 shrink-0"/> {t.phone || "N/A"}
                            </div>
                        </div>
                    </td>
                    
                    {/* DISPLAY ASSIGNMENTS (New Array Logic) */}
                    <td className="p-4">
                        <div className="flex flex-wrap gap-2 max-w-[250px] sm:max-w-xs">
                            {t.assignedClasses && t.assignedClasses.length > 0 ? (
                              t.assignedClasses.map((cls, idx) => (
                                  <div key={idx} className="flex items-center gap-1 bg-white px-2 py-1 rounded text-xs border border-gray-200 shadow-sm whitespace-nowrap">
                                      <span className="font-semibold text-gray-700">{cls.classGrade}-{cls.section}</span>
                                      <span className="text-gray-300">|</span>
                                      <span className="text-indigo-600 font-medium">{cls.subject}</span>
                                  </div>
                              ))
                            ) : (
                                <span className="text-gray-400 text-xs italic">No assignments</span>
                            )}
                        </div>
                    </td>

                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEditModal(t)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                          <Pencil size={18} className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        <button onClick={() => handleDelete(t._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={18} className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
              <User size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">No Teachers Found</h3>
            <p className="text-gray-500 mt-1 text-sm">
              Try adjusting your search or add a new teacher.
            </p>
          </div>
        )}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        // Fixed: Typo in bg-transparent, corrected z-index and padding
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-[100] backdrop-blur-sm">
          {/* Fixed: Added max-h-[90vh] and overflow-y-auto so the modal scrolls on small screens */}
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-5 sm:p-6 relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button onClick={() => setIsModalOpen(false)} className="absolute right-4 top-4 p-2 bg-gray-50 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <X size={18} />
            </button>
            
            <h3 className="text-xl font-bold mb-6 text-gray-800 border-b pb-4 pr-8">
              {editingTeacher ? "Edit Teacher Details" : "Register New Teacher"}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Full Name</label>
                    <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input type="text" required className="w-full border border-gray-300 pl-10 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" placeholder="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Phone Number</label>
                    <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input type="text" className="w-full border border-gray-300 pl-10 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" maxLength={10} placeholder="e.g. 9857514526" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                    </div>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input type="email" required className="w-full border border-gray-300 pl-10 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" placeholder="teacher@school.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">{editingTeacher ? "New Password (Optional)" : "Password"}</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required={!editingTeacher} 
                    placeholder={editingTeacher ? "Leave blank to keep" : "••••••••"} 
                    className="w-full border border-gray-300 pl-10 pr-10 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" 
                    value={formData.password} 
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* --- ASSIGNMENT SECTION (Multi-Class) --- */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mt-6">
                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                   <Layers size={16} className="text-indigo-600" /> Assign Classes & Subjects
                </label>

                {/* Fixed: Input Row stacks on mobile (flex-col) and sits side-by-side on sm+ screens */}
                <div className="flex flex-col sm:flex-row gap-2 mb-4">
                    <input 
                        type="text"
                        placeholder="Class (e.g. 10)" 
                        className="w-full sm:w-1/4 border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                        value={tempClass.classGrade}
                        onChange={(e) => setTempClass({...tempClass, classGrade: e.target.value})} 
                    />
                    <input 
                        type="text"
                        placeholder="Sec (e.g. A)" 
                        className="w-full sm:w-1/4 border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                        value={tempClass.section}
                        onChange={(e) => setTempClass({...tempClass, section: e.target.value})} 
                    />
                    <input 
                        type="text"
                        placeholder="Subject (e.g. Math)" 
                        className="w-full sm:w-1/3 border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                        value={tempClass.subject}
                        onChange={(e) => setTempClass({...tempClass, subject: e.target.value})} 
                    />
                    <button 
                        type="button" 
                        onClick={addClassToList}
                        className="w-full sm:w-auto bg-indigo-600 text-white p-2.5 rounded-lg hover:bg-indigo-700 flex items-center justify-center transition-colors shadow-sm shrink-0"
                        title="Add Class"
                    >
                        <PlusCircle size={18} className="mr-1.5 sm:mr-0" />
                        <span className="sm:hidden text-sm font-bold">Add Assignment</span>
                    </button>
                </div>

                {/* List */}
                <div className="space-y-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                    {formData.assignedClasses.length === 0 ? (
                        <p className="text-xs text-gray-400 italic text-center py-2">No classes assigned yet. Add one above.</p>
                    ) : (
                        formData.assignedClasses.map((cls, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-gray-200 text-sm shadow-sm">
                                <span className="font-medium text-gray-700 flex flex-wrap items-center gap-1.5">
                                    <span className="bg-gray-100 text-gray-500 text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wide border border-gray-200">Class</span>
                                    {cls.classGrade}-{cls.section} 
                                    <span className="text-gray-300 mx-1">|</span> 
                                    <span className="text-indigo-600 font-bold">{cls.subject}</span>
                                </span>
                                <button 
                                    type="button" 
                                    onClick={() => removeClassFromList(idx)} 
                                    className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-md transition-colors shrink-0 ml-2"
                                >
                                    <MinusCircle size={18} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
              </div>

              {/* Fixed: Modal action buttons stretch full width and reverse on mobile */}
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto px-5 py-2.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold transition-colors">Cancel</button>
                <button type="submit" disabled={loading} className="w-full sm:w-auto px-6 py-2.5 text-sm bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-sm font-bold transition-colors disabled:opacity-70 flex justify-center items-center">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingTeacher ? "Update Teacher" : "Create Teacher")}
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