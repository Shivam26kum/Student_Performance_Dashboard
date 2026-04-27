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
    <div className="max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Teacher Directory</h2>
          <p className="text-gray-500">Manage faculty, assignments, and subjects</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-sm font-medium"
        >
          <Plus size={20} /> Add Teacher
        </button>
      </div>

      {/* SEARCH */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by name, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center items-center text-gray-500">
            <Loader2 className="animate-spin mr-2" /> Loading records...
          </div>
        ) : filteredTeachers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Profile</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Contact Info</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Assignments</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTeachers.map((t) => (
                  <tr key={t._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold shrink-0">
                        {t.name.charAt(0)}
                      </div>
                      <div>
                          <span className="block font-medium text-gray-800">{t.name}</span>
                          <span className="text-xs text-gray-500">ID: {t._id.slice(-4)}</span>
                      </div>
                    </td>
                    <td className="p-4">
                        <div className="flex flex-col text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                                <Mail size={14} className="text-gray-400"/> {t.email}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <Phone size={14} className="text-gray-400"/> {t.phone || "N/A"}
                            </div>
                        </div>
                    </td>
                    
                    {/* DISPLAY ASSIGNMENTS (New Array Logic) */}
                    <td className="p-4">
                        <div className="flex flex-wrap gap-2 max-w-xs">
                            {t.assignedClasses && t.assignedClasses.length > 0 ? (
                              t.assignedClasses.map((cls, idx) => (
                                  <div key={idx} className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded text-xs border border-gray-200">
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

                    <td className="p-4 text-right flex justify-end gap-2">
                      <button onClick={() => openEditModal(t)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg">
                        <Pencil size={18} />
                      </button>
                      <button onClick={() => handleDelete(t._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 size={18} />
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
              <User size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">No Teachers Found</h3>
            <p className="text-gray-500 mt-1">
              Try adjusting your search or add a new teacher.
            </p>
          </div>
        )}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-trasparent bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 relative animate-fade-in">
            <button onClick={() => setIsModalOpen(false)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"><X size={20} /></button>
            <h3 className="text-xl font-bold mb-6 text-gray-800 border-b pb-4">
              {editingTeacher ? "Edit Teacher Details" : "Register New Teacher"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <div className="relative">
                        <User className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input type="text" required className="w-full border border-gray-300 pl-10 p-2 rounded-lg" placeholder="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input type="text" className="w-full border border-gray-300 pl-10 p-2 rounded-lg" maxLength={10} placeholder="+91 98575 14526" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                    </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  <input type="email" required className="w-full border border-gray-300 pl-10 p-2 rounded-lg" placeholder="teacher@school.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{editingTeacher ? "New Password (Optional)" : "Password"}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required={!editingTeacher} 
                    placeholder={editingTeacher ? "Leave blank to keep" : "••••••••"} 
                    className="w-full border border-gray-300 pl-10 pr-10 p-2 rounded-lg" 
                    value={formData.password} 
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* --- ASSIGNMENT SECTION (Multi-Class) --- */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <label className="'block' text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                   <Layers size={16} /> Assign Classes & Subjects
                </label>

                {/* Input Row */}
                <div className="flex gap-2 mb-3">
                    <input 
                        type="text"
                        placeholder="Class" 
                        className="w-1/4 border border-gray-300 p-2 rounded-lg text-sm"
                        value={tempClass.classGrade}
                        onChange={(e) => setTempClass({...tempClass, classGrade: e.target.value})} 
                    />
                    <input 
                        type="text"
                        placeholder="Sec" 
                        className="w-1/4 border border-gray-300 p-2 rounded-lg text-sm"
                        value={tempClass.section}
                        onChange={(e) => setTempClass({...tempClass, section: e.target.value})} 
                    />
                    <div className="relative w-1/3">
                        <input 
                            type="text"
                            placeholder="Subject" 
                            className="w-full border border-gray-300 p-2 rounded-lg text-sm"
                            value={tempClass.subject}
                            onChange={(e) => setTempClass({...tempClass, subject: e.target.value})} 
                        />
                    </div>
                    <button 
                        type="button" 
                        onClick={addClassToList}
                        className="bg-indigo-600 text-white px-3 rounded-lg hover:bg-indigo-700 flex items-center justify-center transition-colors"
                        title="Add Class"
                    >
                        <PlusCircle size={20} />
                    </button>
                </div>

                {/* List */}
                <div className="space-y-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                    {formData.assignedClasses.length === 0 ? (
                        <p className="text-xs text-gray-400 italic text-center py-2">No classes assigned yet. Add one above.</p>
                    ) : (
                        formData.assignedClasses.map((cls, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-white p-2 rounded border border-gray-200 text-sm shadow-sm">
                                <span className="font-medium text-gray-700 flex items-center">
                                    <span className="bg-gray-100 text-gray-500 text-[10px] px-1.5 rounded mr-2 uppercase tracking-wide">Class</span>
                                    {cls.classGrade}-{cls.section} 
                                    <span className="text-gray-300 mx-2">|</span> 
                                    <span className="text-indigo-600 font-semibold">{cls.subject}</span>
                                </span>
                                <button 
                                    type="button" 
                                    onClick={() => removeClassFromList(idx)} 
                                    className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1 rounded transition"
                                >
                                    <MinusCircle size={18} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium">Cancel</button>
                <button type="submit" disabled={loading} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm font-medium">{loading ? "Saving..." : (editingTeacher ? "Update Teacher" : "Create Teacher")}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}