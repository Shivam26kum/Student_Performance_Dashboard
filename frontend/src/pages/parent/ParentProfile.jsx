import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/api";
import { User, Phone, Mail, MapPin, Calendar, Droplets, BookOpen, Hash, Edit2, Save, X, Loader2 } from "lucide-react";
import { useToaster } from "react-toastella";

export default function ParentProfile() {
  const { name } = useAuth();
  const { notify } = useToaster();

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [profileData, setProfileData] = useState(null);
  
  // Holds the editable state
  const [formData, setFormData] = useState({
    student: { name: "", class: "", section: "", rollNo: "", dob: "", bloodGroup: "", admissionNo: "" },
    parent: { name: "", relation: "", phone: "", email: "", address: "" }
  });

  // Fetch Profile Data from DB
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/parent/profile");
      
      // Ensure we have fallback empty strings if data is null/empty
      const payload = {
        student: {
          name: data?.student?.name || "",
          class: data?.student?.class || "",
          section: data?.student?.section || "",
          rollNo: data?.student?.rollNo || "",
          dob: data?.student?.dob ? new Date(data.student.dob).toISOString().split('T')[0] : "",
          bloodGroup: data?.student?.bloodGroup || "",
          admissionNo: data?.student?.admissionNo || ""
        },
        parent: {
          name: data?.parent?.name || name || "",
          relation: data?.parent?.relation || "",
          phone: data?.parent?.phone || "",
          email: data?.parent?.email || "",
          address: data?.parent?.address || ""
        }
      };

      setProfileData(payload);
      setFormData(payload);
    } catch (err) {
      console.error(err);
      notify({ message: "Failed to load profile data.", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [name, notify]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Handle Input Changes
  const handleInputChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  // Submit Updated Data to Backend
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // You will need a PUT route in your backend for this (see below)
      await api.put("/api/parent/profile", formData);
      setProfileData(formData);
      setIsEditing(false);
      notify({ message: "Profile updated successfully!", type: "success" });
    } catch (err) {
      notify({ message: "Failed to save profile changes.", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  // Cancel Editing
  const handleCancel = () => {
    setFormData(profileData); // Revert to saved data
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    // Fixed: Added responsive outer padding
    <div className="h-full flex flex-col max-w-6xl mx-auto overflow-hidden p-4 sm:p-6 lg:p-8 font-sans">
      
      {/* --- HEADER --- */}
      <div className="shrink-0 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Family Profile</h1>
          <p className="text-slate-500 font-medium text-sm sm:text-base mt-1">
            {isEditing ? "Update your details below." : "View student and guardian details."}
          </p>
        </div>
        
        {/* Action Buttons */}
        {/* Fixed: Buttons stretch to full width on mobile, sit side-by-side on larger screens */}
        <div className="w-full sm:w-auto">
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white px-5 py-3 sm:py-2.5 rounded-xl font-bold transition-all shadow-sm active:scale-95"
            >
              <Edit2 size={16} /> Edit Profile
            </button>
          ) : (
            <div className="flex flex-col-reverse sm:flex-row items-center gap-3 w-full sm:w-auto">
              <button 
                onClick={handleCancel}
                disabled={isSaving}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-100 text-slate-500 hover:bg-slate-200 px-5 py-3 sm:py-2.5 rounded-xl font-bold transition-all"
              >
                <X size={16} /> Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 text-white hover:bg-indigo-700 px-5 py-3 sm:py-2.5 rounded-xl font-bold transition-all shadow-md active:scale-95"
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>

      {/* --- SCROLLABLE CONTENT --- */}
      {/* Fixed: Adjusted gaps for mobile */}
      <div className="flex-1 flex flex-col min-h-0 pb-2 overflow-y-auto custom-scrollbar pr-1 sm:pr-2 gap-6 sm:gap-8">
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 h-fit">
          
          {/* STUDENT DETAILS CARD */}
          {/* Fixed: Scaled border radius and paddings */}
          <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="bg-indigo-600 p-6 sm:p-8 flex flex-col items-center justify-center text-white relative">
               <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-white opacity-10 rounded-full -mr-8 sm:-mr-10 -mt-8 sm:-mt-10 pointer-events-none"></div>
               <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white text-indigo-600 rounded-2xl sm:rounded-3xl flex items-center justify-center font-black text-3xl sm:text-4xl shadow-xl z-10 mb-4 shrink-0">
                 {formData.student.name ? formData.student.name.charAt(0).toUpperCase() : "S"}
               </div>
               
               {isEditing ? (
                 <input 
                   type="text" 
                   value={formData.student.name}
                   onChange={(e) => handleInputChange("student", "name", e.target.value)}
                   placeholder="Student Full Name"
                   // Fixed: Expanded width on mobile
                   className="text-lg sm:text-xl font-black z-10 bg-indigo-700/50 text-center border border-indigo-400 rounded-lg px-3 sm:px-4 py-2 focus:outline-none focus:border-white placeholder:text-indigo-300 w-[90%] sm:w-3/4 transition-all"
                 />
               ) : (
                 <h2 className="text-xl sm:text-2xl font-black z-10 text-center">{formData.student.name || "Not Provided"}</h2>
               )}
               <p className="text-indigo-200 font-bold text-[10px] sm:text-xs uppercase tracking-[0.2em] mt-2 z-10 text-center">Student Profile</p>
            </div>

            {/* Fixed: Scaled paddings and space-y for mobile */}
            <div className="p-5 sm:p-6 md:p-8 space-y-5 md:space-y-6 flex-1 bg-slate-50/30">
               <ProfileRow isEditing={isEditing} section="student" field="class" icon={<BookOpen size={16} className="sm:w-[18px] sm:h-[18px]" />} label="Class" value={formData.student.class} onChange={handleInputChange} />
               <ProfileRow isEditing={isEditing} section="student" field="section" icon={<BookOpen size={16} className="sm:w-[18px] sm:h-[18px]" />} label="Section" value={formData.student.section} onChange={handleInputChange} />
               <ProfileRow isEditing={isEditing} section="student" field="rollNo" icon={<Hash size={16} className="sm:w-[18px] sm:h-[18px]" />} label="Roll Number" value={formData.student.rollNo} onChange={handleInputChange} />
               <ProfileRow isEditing={isEditing} section="student" field="dob" icon={<Calendar size={16} className="sm:w-[18px] sm:h-[18px]" />} label="Date of Birth" value={formData.student.dob} type="date" onChange={handleInputChange} />
               <ProfileRow isEditing={isEditing} section="student" field="bloodGroup" icon={<Droplets size={16} className="sm:w-[18px] sm:h-[18px]" />} label="Blood Group" value={formData.student.bloodGroup} color="text-rose-500" onChange={handleInputChange} />
               <ProfileRow isEditing={isEditing} section="student" field="admissionNo" icon={<Hash size={16} className="sm:w-[18px] sm:h-[18px]" />} label="Admission No." value={formData.student.admissionNo} onChange={handleInputChange} />
            </div>
          </div>

          {/* GUARDIAN DETAILS CARD */}
          <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="bg-slate-800 p-6 sm:p-8 flex flex-col items-center justify-center text-white relative">
               <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-700 border-4 border-slate-600 text-slate-300 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-xl z-10 mb-4 shrink-0">
                 <User size={40} className="sm:w-12 sm:h-12" strokeWidth={2.5} />
               </div>

               {isEditing ? (
                 <input 
                   type="text" 
                   value={formData.parent.name}
                   onChange={(e) => handleInputChange("parent", "name", e.target.value)}
                   placeholder="Guardian Full Name"
                   // Fixed: Expanded width on mobile
                   className="text-lg sm:text-xl font-black z-10 bg-slate-700/50 text-center border border-slate-500 rounded-lg px-3 sm:px-4 py-2 focus:outline-none focus:border-white placeholder:text-slate-400 w-[90%] sm:w-3/4 transition-all"
                 />
               ) : (
                 <h2 className="text-xl sm:text-2xl font-black z-10 text-center">{formData.parent.name || "Not Provided"}</h2>
               )}
               <p className="text-slate-400 font-bold text-[10px] sm:text-xs uppercase tracking-[0.2em] mt-2 z-10 text-center">Primary Guardian</p>
            </div>

            <div className="p-5 sm:p-6 md:p-8 space-y-5 md:space-y-6 flex-1 bg-slate-50/30">
               <ProfileRow isEditing={isEditing} section="parent" field="relation" icon={<User size={16} className="sm:w-[18px] sm:h-[18px]" />} label="Relation to Student" value={formData.parent.relation} onChange={handleInputChange} />
               <ProfileRow isEditing={isEditing} section="parent" field="phone" icon={<Phone size={16} className="sm:w-[18px] sm:h-[18px]" />} label="Contact Number" value={formData.parent.phone} type="tel" onChange={handleInputChange} />
               <ProfileRow isEditing={isEditing} section="parent" field="email" icon={<Mail size={16} className="sm:w-[18px] sm:h-[18px]" />} label="Email Address" value={formData.parent.email} type="email" onChange={handleInputChange} />
               <ProfileRow isEditing={isEditing} section="parent" field="address" icon={<MapPin size={16} className="sm:w-[18px] sm:h-[18px]" />} label="Residential Address" value={formData.parent.address} isLong={true} onChange={handleInputChange} />
            </div>
          </div>

        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #E2E8F0; border-radius: 10px; }
        @media (min-width: 640px) {
          .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        }
      `}} />
    </div>
  );
}

// Editable Sub-component for individual rows
function ProfileRow({ icon, label, value, color = "text-indigo-600", isLong = false, isEditing, section, field, type = "text", onChange }) {
  return (
    // Fixed: Scaled icon container and text for smaller screens
    <div className={`flex items-start gap-3 sm:gap-4 ${isLong ? 'items-start' : 'items-center'}`}>
      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm ${color}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{label}</p>
        
        {isEditing ? (
          type === "textarea" || isLong ? (
            <textarea 
              value={value}
              onChange={(e) => onChange(section, field, e.target.value)}
              className="mt-1 w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
              rows={3}
              placeholder={`Enter ${label}`}
            />
          ) : (
            <input 
              type={type}
              value={value}
              onChange={(e) => onChange(section, field, e.target.value)}
              className="mt-1 w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder={`Enter ${label}`}
            />
          )
        ) : (
          <p className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5 leading-snug break-words">
            {value || <span className="text-slate-300 italic font-medium">Not provided</span>}
          </p>
        )}
      </div>
    </div>
  );
}