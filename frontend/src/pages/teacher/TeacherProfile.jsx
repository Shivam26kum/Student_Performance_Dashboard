import { useState, useEffect } from "react";
import { getTeacherProfile, updateTeacherProfile } from "../../api/teacherApi";
import { 
  UserCircle, Mail, Phone, Lock, Save, 
  Loader2, Camera, Briefcase, GraduationCap, 
  MapPin, ShieldCheck 
} from "lucide-react";
import { useToaster } from "react-toastella";

export default function TeacherProfile() {
  const { notify } = useToaster();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    designation: "",
    qualification: "",
    bio: "",
    address: ""
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await getTeacherProfile();
        setProfile(data);
      } catch (err) {
        console.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateTeacherProfile(profile);
      notify({ message: "Profile updated successfully!", type: "success" });
    } catch (err) {
      notify({ message: "Update failed.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <ProfileSkeleton />;

  return (
    <div className="h-full flex flex-col max-w-6xl mx-auto overflow-hidden p-4 font-sans">
      
      {/* HEADER */}
      <div className="shrink-0 bg-white p-6 rounded-xl shadow-sm mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <ShieldCheck className="text-emerald-600" size={24} /> Teacher Account
        </h2>
        <p className="text-sm font-medium text-gray-500 mt-1">Update your public profile and contact preferences.</p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT: IDENTITY CARD */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm flex flex-col items-center text-center">
              <div className="relative group">
                <div className="w-32 h-32 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center text-4xl font-black border-4 border-white shadow-xl rotate-3 group-hover:rotate-0 transition-transform duration-300">
                  {profile.name?.charAt(0) || "T"}
                </div>
                <label className="absolute -bottom-2 -right-2 p-2.5 bg-emerald-600 text-white rounded-xl shadow-lg cursor-pointer hover:bg-emerald-700 transition-colors border-2 border-white">
                  <Camera size={18} />
                  <input type="file" className="hidden" accept="image/*" />
                </label>
              </div>
              
              <div className="mt-6">
                <h3 className="text-xl font-bold text-gray-800">{profile.name}</h3>
                <span className="inline-block mt-1 px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                  {profile.designation || "Senior Faculty"}
                </span>
              </div>

              <div className="w-full mt-8 space-y-3 pt-6 border-t border-gray-50">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Employee ID</span>
                  <span className="text-sm font-bold text-gray-700">#TCH-2026</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Status</span>
                  <span className="flex items-center gap-1 text-sm font-bold text-green-600">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Active
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-emerald-900 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
               <h4 className="font-bold mb-1">Teacher Notice</h4>
               <p className="text-emerald-200 text-xs leading-relaxed">Your profile information is visible to parents and school administrators.</p>
            </div>
          </div>

          {/* RIGHT: EDITABLE FORM CARDS */}
          <div className="lg:col-span-2">
            <form onSubmit={handleUpdate} className="space-y-6">
              
              {/* PERSONAL INFORMATION CARD */}
              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-6 flex items-center gap-2">
                  <UserCircle size={18} className="text-emerald-500" /> Personal Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Full Name</label>
                    <input 
                      className="w-full bg-gray-50 border-none rounded-xl p-3.5 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                      value={profile.name}
                      onChange={(e) => setProfile({...profile, name: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-3.5 text-gray-400" size={16} />
                      <input 
                        className="w-full bg-gray-50 border-none rounded-xl p-3.5 pl-12 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        value={profile.phone}
                        onChange={(e) => setProfile({...profile, phone: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Work Email (Protected)</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 text-gray-400" size={16} />
                      <input 
                        disabled
                        className="w-full bg-gray-50 border-none rounded-xl p-3.5 pl-12 text-sm font-bold text-gray-400 cursor-not-allowed"
                        value={profile.email}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* PROFESSIONAL DETAILS CARD */}
              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-6 flex items-center gap-2">
                  <GraduationCap size={18} className="text-emerald-500" /> Professional Details
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Qualification</label>
                    <div className="relative">
                      <GraduationCap className="absolute left-4 top-3.5 text-gray-400" size={16} />
                      <input 
                        className="w-full bg-gray-50 border-none rounded-xl p-3.5 pl-12 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        placeholder="e.g. M.Sc Physics, B.Ed"
                        value={profile.qualification}
                        onChange={(e) => setProfile({...profile, qualification: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Designation</label>
                    <div className="relative">
                      <Briefcase className="absolute left-4 top-3.5 text-gray-400" size={16} />
                      <input 
                        className="w-full bg-gray-50 border-none rounded-xl p-3.5 pl-12 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        value={profile.designation}
                        onChange={(e) => setProfile({...profile, designation: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Home Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-3.5 text-gray-400" size={16} />
                      <input 
                        className="w-full bg-gray-50 border-none rounded-xl p-3.5 pl-12 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        value={profile.address}
                        onChange={(e) => setProfile({...profile, address: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTION BAR */}
              <div className="flex justify-end pt-4">
                <button 
                  disabled={saving}
                  className="bg-emerald-600 text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-3 hover:bg-emerald-700 active:scale-95 transition-all shadow-xl shadow-emerald-100 disabled:opacity-70"
                >
                  {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  Update Profile
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #e2e8f0; border-radius: 10px; }
      `}} />
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="max-w-6xl mx-auto p-4 animate-pulse h-full overflow-hidden flex flex-col gap-6">
      <div className="shrink-0 h-24 bg-gray-200 rounded-2xl" />
      <div className="flex-1 grid grid-cols-3 gap-6">
        <div className="col-span-1 bg-gray-200 rounded-2xl" />
        <div className="col-span-2 space-y-6">
          <div className="h-64 bg-gray-200 rounded-2xl" />
          <div className="h-64 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}