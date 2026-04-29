import { useState, useEffect, useCallback, useMemo } from "react";
import { getClasses, setClassFee } from "../../api/adminApi"; 
import { 
  Wallet, Save, LayoutGrid, Loader2, IndianRupee, 
  RefreshCcw, TrendingUp, Users as UsersIcon, Clock,
  ShieldCheck, Zap, Info, Bus, PlusCircle
} from "lucide-react";
import { useToaster } from "react-toastella";

export default function AdminFeeSetup() {
  const { notify } = useToaster();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [feeInputs, setFeeInputs] = useState({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getClasses();
      const classList = Array.isArray(data) ? data : [];
      setClasses(classList);

      const initialInputs = {};
      classList.forEach(cls => {
        initialInputs[cls._id] = {
          monthly: cls.monthlyFee || 0,
          busFee: cls.busFee || 0,
          otherFee: cls.otherFee || 0,
          penalty: cls.lateFeePenalty || 0
        };
      });
      setFeeInputs(initialInputs);
    } catch (err) {
      notify({ message: "Sync failed: Connection refused", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalProjectedMonthly = useMemo(() => {
    if (!classes.length) return 0;
    return classes.reduce((acc, cls) => {
      const inputs = feeInputs[cls._id] || {};
      const totalFees = (Number(inputs.monthly) || 0) + (Number(inputs.busFee) || 0) + (Number(inputs.otherFee) || 0);
      return acc + (Number(cls.studentCount || 0) * totalFees);
    }, 0);
  }, [classes, feeInputs]);

  const handleInputChange = (id, field, value) => {
    const val = value === "" ? "" : parseFloat(value);
    setFeeInputs(prev => ({
      ...prev,
      [id]: { 
        ...(prev[id] || { monthly: 0, busFee: 0, otherFee: 0, penalty: 0 }), 
        [field]: val 
      }
    }));
  };

  const handleSaveFee = async (classId, className) => {
    setSavingId(classId);
    try {
      const inputs = feeInputs[classId];
      
      const payload = {
        monthly: Number(inputs?.monthly) || 0,
        busFee: Number(inputs?.busFee) || 0,
        otherFee: Number(inputs?.otherFee) || 0,
        penalty: Number(inputs?.penalty) || 0
      };

      const response = await setClassFee(classId, payload);
      
      if(response.status === 200 || response.status === 201) {
        notify({ message: `Ledger Updated: ${className}`, type: "success" });
        fetchData(); 
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Data rejection: 500 Internal Error";
      notify({ message: errorMsg, type: "error" });
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <Loader2 size={32} className="animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    // Fixed: Adjusted padding for mobile (p-4) vs laptop (md:p-8)
    <div className="h-full flex flex-col p-4 sm:p-6 md:p-8 font-sans bg-[#F8FAFC] overflow-hidden relative">
      
      {/* HEADER */}
      {/* Fixed: Stacked flex-col on mobile, flex-row on desktop */}
      <div className="shrink-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-5 mb-6 md:mb-8">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2 md:gap-3">
            <Wallet size={24} className="text-indigo-600 shrink-0" />
            Fee Configuration
          </h1>
          <p className="text-slate-500 text-xs md:text-sm font-medium italic mt-1 md:mt-0">Tuition, Transport, and Miscellaneous charges</p>
        </div>

        {/* Fixed: Made the actions span full width on mobile for better touch targets */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="bg-white px-4 md:px-5 py-2 md:py-2.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3 flex-1 md:flex-none">
            <TrendingUp size={18} className="text-emerald-500 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">Monthly Yield</span>
              <span className="text-base md:text-lg font-black text-slate-900">₹{totalProjectedMonthly.toLocaleString()}</span>
            </div>
          </div>
          <button onClick={fetchData} className="p-3 bg-white hover:bg-slate-50 text-slate-400 rounded-xl border border-slate-200 transition-all active:scale-95 shadow-sm shrink-0">
            <RefreshCcw size={20} />
          </button>
        </div>
      </div>

      {/* GRID SECTION */}
      {/* Fixed: Added adequate padding-bottom so the sticky footer doesn't cover the last cards */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 pb-28 md:pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {classes.map((cls) => (
            // Fixed: Padding adjusted for mobile (p-4 to p-6)
            <div key={cls._id} className="group bg-white rounded-[2rem] p-4 sm:p-5 md:p-6 border border-slate-200 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
              
              <div className="flex justify-between items-start mb-5">
                <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-wider group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  {cls.name}
                </span>
                <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-slate-400 font-bold bg-slate-50 px-2 sm:px-3 py-1 rounded-lg">
                  <UsersIcon size={12} className="sm:w-[14px] sm:h-[14px]" /> {cls.studentCount || 0} Students
                </div>
              </div>

              <div className="space-y-4">
                {/* Tuition Fee */}
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-1 block">Tuition Fee</label>
                  <div className="relative">
                    <IndianRupee size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input 
                      type="number"
                      value={feeInputs[cls._id]?.monthly ?? ""}
                      onChange={(e) => handleInputChange(cls._id, "monthly", e.target.value)}
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-400 focus:bg-white p-3.5 pl-10 rounded-2xl outline-none font-bold text-slate-800 text-sm transition-all"
                      placeholder="Enter amount"
                    />
                  </div>
                </div>

                {/* Fixed: Switched to grid-cols-1 on very small mobile, grid-cols-2 on slightly larger screens */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  {/* Bus Fee */}
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block flex items-center gap-1">
                      <Bus size={10} /> Bus (Opt)
                    </label>
                    <div className="relative">
                      <IndianRupee size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                      <input 
                        type="number"
                        value={feeInputs[cls._id]?.busFee ?? ""}
                        onChange={(e) => handleInputChange(cls._id, "busFee", e.target.value)}
                        className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-400 focus:bg-white p-3 pl-8 rounded-xl outline-none font-bold text-slate-700 text-xs transition-all"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* Other Fee */}
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block flex items-center gap-1">
                      <PlusCircle size={10} /> Other (Opt)
                    </label>
                    <div className="relative">
                      <IndianRupee size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                      <input 
                        type="number"
                        value={feeInputs[cls._id]?.otherFee ?? ""}
                        onChange={(e) => handleInputChange(cls._id, "otherFee", e.target.value)}
                        className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-400 focus:bg-white p-3 pl-8 rounded-xl outline-none font-bold text-slate-700 text-xs transition-all"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Penalty */}
                <div className="pt-2 border-t border-slate-50">
                  <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest ml-1 mb-1 block flex items-center gap-1">
                    <Clock size={12} /> Late Penalty
                  </label>
                  <div className="relative">
                    <IndianRupee size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-rose-200" />
                    <input 
                      type="number"
                      value={feeInputs[cls._id]?.penalty ?? ""}
                      onChange={(e) => handleInputChange(cls._id, "penalty", e.target.value)}
                      className="w-full bg-rose-50/30 border-2 border-transparent focus:border-rose-300 focus:bg-white p-3.5 pl-10 rounded-2xl outline-none font-black text-rose-700 text-sm transition-all"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <button 
                onClick={() => handleSaveFee(cls._id, cls.name)}
                disabled={savingId === cls._id}
                className="w-full mt-5 md:mt-6 bg-slate-900 hover:bg-indigo-600 text-white py-3.5 md:py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-slate-200"
              >
                {savingId === cls._id ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Update Ledger
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      {/* Fixed: Width constraints for mobile (w-[95%]), inner flex wrapping for clean alignment */}
      <div className="fixed bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 w-[95%] md:w-max z-10">
        <div className="bg-slate-900/95 backdrop-blur-md px-4 md:px-6 py-3 md:py-2.5 rounded-2xl md:rounded-full border border-slate-700 flex flex-col md:flex-row items-center gap-2 md:gap-5 shadow-2xl">
          <div className="flex items-center gap-2 md:border-r border-slate-700 md:pr-5">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest text-center">Secure Ledger</span>
          </div>
          <div className="flex items-center gap-2 text-center">
            <Info size={14} className="text-slate-400 hidden md:block" />
            <p className="text-[10px] text-slate-300 font-medium tracking-tight">
              Late fees apply automatically on the <span className="text-white font-bold">8th of each month</span>.
            </p>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #E2E8F0; border-radius: 10px; }
        @media (min-width: 768px) {
          .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        }
      `}} />
    </div>
  );
}