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
    <div className="h-full flex flex-col max-w-5xl mx-auto overflow-hidden p-8 font-sans">
      
      {/* --- HEADER --- */}
      <div className="shrink-0 flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2">
            <Settings className="text-indigo-600" size={28} /> Control Settings
          </h1>
          <p className="text-sm text-gray-500 font-medium">Configure school identity and account security.</p>
        </div>
      </div>

      {/* --- MAIN CONTENT (Scrollable) --- */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
        <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-10">
          
          {/* SCHOOL BRANDING CARD */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                <School size={20} />
              </div>
              <h3 className="font-black text-gray-800 uppercase text-xs tracking-widest">School Identity</h3>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Institution Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 text-gray-400" size={16} />
                  <input 
                    type="text"
                    className="w-full bg-gray-50 border-none rounded-2xl p-4 pl-12 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500/10"
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">System Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 text-gray-400" size={16} />
                  <input 
                    type="email"
                    className="w-full bg-gray-50 border-none rounded-2xl p-4 pl-12 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500/10"
                    value={profile.email}
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECURITY CARD */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
                <Shield size={20} />
              </div>
              <h3 className="font-black text-gray-800 uppercase text-xs tracking-widest">Security & Access</h3>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Change Admin Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 text-gray-400" size={16} />
                  <input 
                    type="password"
                    placeholder="Enter new password"
                    className="w-full bg-gray-50 border-none rounded-2xl p-4 pl-12 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-rose-500/10"
                    value={profile.password}
                    onChange={(e) => setProfile({...profile, password: e.target.value})}
                  />
                </div>
                <p className="mt-3 text-[10px] text-gray-400 font-medium px-1 flex items-center gap-1">
                  <CheckCircle size={10} className="text-emerald-500" /> Leave blank to keep current password.
                </p>
              </div>
            </div>

            <div className="mt-auto pt-8">
              <button 
                type="submit" 
                disabled={saving}
                className="w-full bg-slate-900 hover:bg-black text-white py-5 rounded-3xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-slate-200 disabled:opacity-50"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                Save Configuration
              </button>
            </div>
          </div>

        </form>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #e2e8f0; border-radius: 10px; }
      `}} />
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="max-w-5xl mx-auto p-8 animate-pulse h-full flex flex-col gap-8">
      <div className="h-20 bg-gray-200 rounded-3xl w-1/3" />
      <div className="flex-1 grid grid-cols-2 gap-8">
        <div className="bg-gray-200 rounded-[2.5rem]" />
        <div className="bg-gray-200 rounded-[2.5rem]" />
      </div>
    </div>
  );
}