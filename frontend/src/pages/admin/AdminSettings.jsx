import { useState, useEffect } from "react";
import api from "../../api/api";
import { 
  Settings, Shield, School, Lock, 
  Save, Loader2, Mail, User, CheckCircle 
} from "lucide-react";
import { useToaster } from "react-toastella";

export default function AdminSettings() {
  const { notify } = useToaster();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get("/api/admin/profile");
        setProfile({ ...data, password: "" });
      } catch (err) {
        console.error("Failed to load admin settings");
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
      await api.put("/api/admin/profile", profile);
      notify({ message: "Settings updated successfully!", type: "success" });
    } catch (err) {
      notify({ message: "Failed to update settings", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageSkeleton />;

  return (
    // Fixed: Responsive container padding
    <div className="h-full flex flex-col max-w-5xl mx-auto overflow-hidden p-4 sm:p-6 md:p-8 font-sans">
      
      {/* --- HEADER --- */}
      <div className="shrink-0 flex justify-between items-center mb-6 md:mb-8">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-gray-800 flex items-center gap-2 md:gap-3">
            <Settings className="text-indigo-600 w-6 h-6 md:w-7 md:h-7" /> Control Settings
          </h1>
          <p className="text-xs md:text-sm text-gray-500 font-medium mt-1">Configure school identity and account security.</p>
        </div>
      </div>

      {/* --- MAIN CONTENT (Scrollable) --- */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 md:pr-2">
        {/* Fixed: Responsive gaps for mobile */}
        <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8 pb-10">
          
          {/* SCHOOL BRANDING CARD */}
          {/* Fixed: Adjusted padding and border radius for mobile */}
          <div className="bg-white p-5 sm:p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col">
            <div className="flex items-center gap-3 mb-6 md:mb-8">
              <div className="p-2.5 md:p-3 bg-indigo-50 text-indigo-600 rounded-xl md:rounded-2xl shrink-0">
                <School size={20} className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              <h3 className="font-black text-gray-800 uppercase text-[10px] md:text-xs tracking-widest">School Identity</h3>
            </div>

            <div className="space-y-5 md:space-y-6">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Institution Name</label>
                <div className="relative">
                  {/* Fixed: Centered icon vertically using top-1/2 and -translate-y-1/2 */}
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                    type="text"
                    className="w-full bg-gray-50 border-none rounded-xl md:rounded-2xl p-3.5 md:p-4 pl-11 md:pl-12 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all"
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">System Email</label>
                <div className="relative">
                  {/* Fixed: Centered icon vertically */}
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                    type="email"
                    className="w-full bg-gray-50 border-none rounded-xl md:rounded-2xl p-3.5 md:p-4 pl-11 md:pl-12 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all"
                    value={profile.email}
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECURITY CARD */}
          <div className="bg-white p-5 sm:p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col">
            <div className="flex items-center gap-3 mb-6 md:mb-8">
              <div className="p-2.5 md:p-3 bg-rose-50 text-rose-600 rounded-xl md:rounded-2xl shrink-0">
                <Shield size={20} className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              <h3 className="font-black text-gray-800 uppercase text-[10px] md:text-xs tracking-widest">Security & Access</h3>
            </div>

            <div className="space-y-5 md:space-y-6">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Change Admin Password</label>
                <div className="relative">
                  {/* Fixed: Centered icon vertically */}
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                    type="password"
                    placeholder="Enter new password"
                    className="w-full bg-gray-50 border-none rounded-xl md:rounded-2xl p-3.5 md:p-4 pl-11 md:pl-12 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-rose-500/10 transition-all"
                    value={profile.password}
                    onChange={(e) => setProfile({...profile, password: e.target.value})}
                  />
                </div>
                <p className="mt-3 text-[9px] md:text-[10px] text-gray-400 font-medium px-1 flex items-center gap-1.5 leading-tight">
                  <CheckCircle size={10} className="text-emerald-500 shrink-0" /> Leave blank to keep current password.
                </p>
              </div>
            </div>

            <div className="mt-auto pt-6 md:pt-8">
              <button 
                type="submit" 
                disabled={saving}
                className="w-full bg-slate-900 hover:bg-black text-white py-4 md:py-5 rounded-[1.25rem] md:rounded-3xl font-black text-[10px] md:text-xs uppercase tracking-widest flex items-center justify-center gap-2 md:gap-3 transition-all active:scale-95 shadow-xl shadow-slate-200 disabled:opacity-50"
              >
                {saving ? <Loader2 size={16} className="animate-spin md:w-[18px] md:h-[18px]" /> : <Save size={16} className="md:w-[18px] md:h-[18px]" />}
                Save Configuration
              </button>
            </div>
          </div>

        </form>
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
    // Fixed: Skeleton layout now matches responsive mobile view
    <div className="max-w-5xl mx-auto p-4 sm:p-6 md:p-8 animate-pulse h-full flex flex-col gap-6 md:gap-8 w-full">
      <div className="h-16 md:h-20 bg-gray-200 rounded-[1.5rem] md:rounded-3xl w-2/3 md:w-1/3" />
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">
        <div className="bg-gray-200 rounded-[2rem] md:rounded-[2.5rem] h-[350px] md:h-auto" />
        <div className="bg-gray-200 rounded-[2rem] md:rounded-[2.5rem] h-[350px] md:h-auto" />
      </div>
    </div>
  );
}