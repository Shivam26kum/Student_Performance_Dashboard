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
    // Fixed: Added responsive outer padding
    <div className="h-full flex flex-col max-w-6xl mx-auto overflow-hidden p-4 sm:p-6 lg:p-8 font-sans">
      
      {/* HEADER */}
      {/* Fixed: Scaled padding and border radius for mobile */}
      <div className="shrink-0 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-xl shadow-sm border border-gray-100 mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2 sm:gap-3">
          <ShieldCheck className="text-emerald-600 sm:w-7 sm:h-7" size={24} /> Teacher Account
        </h2>
        <p className="text-xs sm:text-sm font-medium text-gray-500 mt-1">Update your public profile and contact preferences.</p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pb-6 pr-1 sm:pr-2">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          
          {/* LEFT: IDENTITY CARD */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border border-gray-100 shadow-sm flex flex-col items-center text-center">
              <div className="relative group">
                <div className="w-28 h-28 sm:w-32 sm:h-32 bg-emerald-50 text-emerald-600 rounded-[1.5rem] sm:rounded-3xl flex items-center justify-center text-3xl sm:text-4xl font-black border-4 border-white shadow-xl rotate-3 group-hover:rotate-0 transition-transform duration-300">
                  {profile.name?.charAt(0) || "T"}
                </div>
                <label className="absolute -bottom-2 -right-2 p-2 sm:p-2.5 bg-emerald-600 text-white rounded-lg sm:rounded-xl shadow-lg cursor-pointer hover:bg-emerald-700 transition-colors border-2 border-white">
                  <Camera size={16} className="sm:w-[18px] sm:h-[18px]" />
                  <input type="file" className="hidden" accept="image/*" />
                </label>
              </div>
              
              <div className="mt-5 sm:mt-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 leading-tight">{profile.name}</h3>
                <span className="inline-block mt-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-full">
                  {profile.designation || "Senior Faculty"}
                </span>
              </div>

              <div className="w-full mt-6 sm:mt-8 space-y-3 pt-5 sm:pt-6 border-t border-gray-50">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider">Employee ID</span>
                  <span className="text-xs sm:text-sm font-bold text-gray-700">#TCH-2026</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</span>
                  <span className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-green-600">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Active
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-emerald-900 p-5 sm:p-6 rounded-2xl sm:rounded-[1.5rem] text-white shadow-lg relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/5 rounded-full -mr-12 -mt-12 sm:-mr-16 sm:-mt-16" />
               <h4 className="font-bold text-sm sm:text-base mb-1 relative z-10">Teacher Notice</h4>
               <p className="text-emerald-200 text-[10px] sm:text-xs leading-relaxed relative z-10">Your profile information is visible to parents and school administrators.</p>
            </div>
          </div>

          {/* RIGHT: EDITABLE FORM CARDS */}
          <div className="lg:col-span-2">
            <form onSubmit={handleUpdate} className="space-y-4 sm:space-y-6">
              
              {/* PERSONAL INFORMATION CARD */}
              <div className="bg-white p-5 sm:p-6 md:p-8 rounded-[1.5rem] sm:rounded-[2rem] border border-gray-100 shadow-sm">
                <h3 className="text-xs sm:text-sm font-bold text-gray-800 uppercase tracking-wider mb-5 sm:mb-6 flex items-center gap-2">
                  <UserCircle size={16} className="text-emerald-500 sm:w-[18px] sm:h-[18px]" /> Personal Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">Full Name</label>
                    <input 
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 sm:p-3.5 text-xs sm:text-sm font-bold text-gray-700 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                      value={profile.name}
                      onChange={(e) => setProfile({...profile, name: e.target.value})}
                    />
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">Phone Number</label>
                    <div className="relative">
                      {/* Fixed: Vertically centered icon dynamically */}
                      <Phone className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input 
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 sm:p-3.5 pl-10 sm:pl-11 text-xs sm:text-sm font-bold text-gray-700 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        value={profile.phone}
                        onChange={(e) => setProfile({...profile, phone: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">Work Email (Protected)</label>
                    <div className="relative">
                      {/* Fixed: Vertically centered icon dynamically */}
                      <Mail className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input 
                        disabled
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 sm:p-3.5 pl-10 sm:pl-11 text-xs sm:text-sm font-bold text-gray-400 cursor-not-allowed"
                        value={profile.email}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* PROFESSIONAL DETAILS CARD */}
              <div className="bg-white p-5 sm:p-6 md:p-8 rounded-[1.5rem] sm:rounded-[2rem] border border-gray-100 shadow-sm">
                <h3 className="text-xs sm:text-sm font-bold text-gray-800 uppercase tracking-wider mb-5 sm:mb-6 flex items-center gap-2">
                  <GraduationCap size={16} className="text-emerald-500 sm:w-[18px] sm:h-[18px]" /> Professional Details
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">Qualification</label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input 
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 sm:p-3.5 pl-10 sm:pl-11 text-xs sm:text-sm font-bold text-gray-700 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        placeholder="e.g. M.Sc Physics, B.Ed"
                        value={profile.qualification}
                        onChange={(e) => setProfile({...profile, qualification: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">Designation</label>
                    <div className="relative">
                      <Briefcase className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input 
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 sm:p-3.5 pl-10 sm:pl-11 text-xs sm:text-sm font-bold text-gray-700 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        value={profile.designation}
                        onChange={(e) => setProfile({...profile, designation: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">Home Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input 
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 sm:p-3.5 pl-10 sm:pl-11 text-xs sm:text-sm font-bold text-gray-700 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        value={profile.address}
                        onChange={(e) => setProfile({...profile, address: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTION BAR */}
              <div className="flex justify-end pt-2 sm:pt-4">
                {/* Fixed: Button spans full width on mobile, auto on sm+ */}
                <button 
                  disabled={saving}
                  className="w-full sm:w-auto bg-emerald-600 text-white px-6 sm:px-10 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest flex items-center justify-center gap-2 sm:gap-3 hover:bg-emerald-700 active:scale-95 transition-all shadow-xl shadow-emerald-100 disabled:opacity-70"
                >
                  {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} className="sm:w-5 sm:h-5" />}
                  Update Profile
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #e2e8f0; border-radius: 10px; }
        @media (min-width: 640px) {
           .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        }
      `}} />
    </div>
  );
}

function ProfileSkeleton() {
  return (
    // Fixed: Matches the responsive layout and grid of the actual component
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 animate-pulse h-full overflow-hidden flex flex-col gap-4 sm:gap-6 w-full">
      <div className="shrink-0 h-20 sm:h-24 bg-gray-200 rounded-2xl w-full" />
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-1 bg-gray-200 rounded-[1.5rem] sm:rounded-[2rem] h-[400px] lg:h-auto w-full" />
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <div className="h-[250px] sm:h-64 bg-gray-200 rounded-[1.5rem] sm:rounded-[2rem] w-full" />
          <div className="h-[250px] sm:h-64 bg-gray-200 rounded-[1.5rem] sm:rounded-[2rem] w-full" />
        </div>
      </div>
    </div>
  );
}