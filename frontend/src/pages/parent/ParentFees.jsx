import { useState, useEffect, useCallback, useMemo } from "react";
import api from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import { 
  IndianRupee, Receipt, Download, AlertCircle, 
  CheckCircle2, WalletCards, Loader2, Bus, PlusCircle, GraduationCap, Clock
} from "lucide-react";
import { useToaster } from "react-toastella";

export default function ParentFees() {
  const { name, email } = useAuth();
  const { notify } = useToaster();
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feeData, setFeeData] = useState({
    monthlyFee: 0,
    busFee: 0,
    otherFee: 0,
    appliedPenalty: 0,
    totalFees: 0,
    paidFees: 0,
    dueFees: 0,
    nextDueDate: "",
    transactions: []
  });

  const fetchFeeStatus = useCallback(async () => {
    setLoading(true);
    try {
      // Endpoint updated to match the route we registered in parentRoutes.js
      const { data } = await api.get("/api/parent/fee-details");
      setFeeData(data);
    } catch (err) {
      console.error("Fetch Error:", err);
      notify({ message: "Unable to reach billing server", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    fetchFeeStatus();
  }, [fetchFeeStatus]);

  // Defensive calculation for the progress bar
  const settlementPercentage = useMemo(() => {
    if (!feeData.totalFees || feeData.totalFees === 0) return 0;
    return ((feeData.paidFees / feeData.totalFees) * 100).toFixed(1);
  }, [feeData.paidFees, feeData.totalFees]);

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      const { data: order } = await api.post("/api/parent/create-order", {
        amount: feeData.dueFees, 
      });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "Campus Connect",
        description: "Official School Fee Payment",
        order_id: order.id,
        handler: async (response) => {
          try {
            await api.post("/api/parent/verify-payment", response);
            notify({ message: "Transaction Verified!", type: "success" });
            fetchFeeStatus(); 
          } catch (err) {
            notify({ message: "Verification Timeout. Contact Admin.", type: "error" });
          }
        },
        prefill: { name, email },
        theme: { color: "#6366F1" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      notify({ message: "Payment Gateway Offline", type: "error" });
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return (
    <div className="h-full flex flex-col items-center justify-center bg-gray-50/30">
      <Loader2 size={40} className="animate-spin text-indigo-600 mb-4" />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse">Syncing Ledger...</p>
    </div>
  );

  return (
    // Fixed: Added responsive padding for mobile view
    <div className="h-full flex flex-col max-w-6xl mx-auto overflow-hidden p-4 sm:p-6 lg:p-8 font-sans">
      
      {/* HEADER SECTION */}
      <div className="shrink-0 mb-6 md:mb-8 flex justify-between items-end gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Financial Overview</h1>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">Review categorized dues and secure payment history.</p>
        </div>
        <div className="hidden sm:flex items-center gap-3 bg-white border border-slate-200 px-4 py-2 rounded-2xl shadow-sm shrink-0">
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Active Billing Cycle</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5 md:gap-8 mb-6 md:mb-10">
        {/* MAIN DUES CARD */}
        {/* Fixed: Scaled border radius and padding for mobile */}
        <div className="lg:col-span-2 bg-slate-900 rounded-[2rem] md:rounded-[3rem] p-6 sm:p-8 md:p-10 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between border border-slate-800">
          <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-indigo-500/10 rounded-full -mr-10 sm:-mr-20 -mt-10 sm:-mt-20 blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10">
            <p className="text-[10px] text-indigo-300 font-black uppercase tracking-[0.2em] mb-3 md:mb-4">Current Outstanding</p>
            {/* Fixed: Scaled text size to prevent overflow on mobile */}
            <h2 className="text-5xl sm:text-6xl md:text-7xl font-black mb-5 sm:mb-6 tracking-tighter truncate">₹{feeData.dueFees.toLocaleString('en-IN')}</h2>
            
            {/* COMPONENT BREAKDOWN */}
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <div className="bg-white/5 border border-white/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl flex items-center gap-1.5 sm:gap-2">
                 <GraduationCap size={14} className="text-indigo-400 shrink-0" />
                 <span className="text-[10px] sm:text-xs font-bold text-slate-300">Tuition: ₹{feeData.monthlyFee}</span>
              </div>
              {feeData.busFee > 0 && (
                <div className="bg-white/5 border border-white/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl flex items-center gap-1.5 sm:gap-2">
                   <Bus size={14} className="text-emerald-400 shrink-0" />
                   <span className="text-[10px] sm:text-xs font-bold text-slate-300">Transport: ₹{feeData.busFee}</span>
                </div>
              )}
              {feeData.otherFee > 0 && (
                <div className="bg-white/5 border border-white/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl flex items-center gap-1.5 sm:gap-2">
                   <PlusCircle size={14} className="text-amber-400 shrink-0" />
                   <span className="text-[10px] sm:text-xs font-bold text-slate-300">Misc: ₹{feeData.otherFee}</span>
                </div>
              )}
              {feeData.appliedPenalty > 0 && (
                <div className="bg-rose-500/20 border border-rose-500/30 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl flex items-center gap-1.5 sm:gap-2">
                   <Clock size={14} className="text-rose-400 shrink-0" />
                   <span className="text-[10px] sm:text-xs font-bold text-rose-200 uppercase tracking-tighter font-black">Late Fee Applied</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 sm:gap-6 relative z-10">
            <div className="flex items-center gap-3 text-slate-400">
              <AlertCircle size={18} className="text-amber-500 shrink-0" />
              <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider leading-relaxed">
                Grace period ends on the 7th. <br className="hidden sm:block"/>
                <span className="sm:hidden"> </span>Next trigger: <span className="text-slate-200">8th of Month</span>
              </p>
            </div>
            {feeData.dueFees > 0 && (
              <button 
                onClick={handlePayment}
                disabled={isProcessing}
                // Fixed: Padding adjusted for mobile
                className="w-full sm:w-auto bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-700 text-white px-6 sm:px-10 py-4 sm:py-5 rounded-2xl sm:rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-500/20 transition-all active:scale-95 flex items-center justify-center gap-3 shrink-0"
              >
                {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <WalletCards size={18} />}
                Pay Now
              </button>
            )}
          </div>
        </div>

        {/* SETTLEMENT PROGRESS CARD */}
        {/* Fixed: Scaled border radius and padding for mobile */}
        <div className="bg-white rounded-[2rem] md:rounded-[3rem] p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5 sm:mb-6 px-1">Payment Statistics</h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between items-center p-3.5 sm:p-4 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-100/50">
                <span className="text-[10px] sm:text-xs font-bold text-slate-500">Total Billed</span>
                <span className="text-xs sm:text-sm font-black text-slate-900">₹{feeData.totalFees.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3.5 sm:p-4 bg-emerald-50 rounded-xl sm:rounded-2xl border border-emerald-100/50">
                <span className="text-[10px] sm:text-xs font-bold text-emerald-700">Amount Paid</span>
                <span className="text-xs sm:text-sm font-black text-emerald-700">₹{feeData.paidFees.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <div className="w-full bg-slate-100 rounded-full h-2 mb-3 sm:mb-4 overflow-hidden">
              <div 
                className="bg-indigo-500 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
                style={{ width: `${settlementPercentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Clearance</span>
              <span className="text-base sm:text-lg font-black text-indigo-600 tracking-tighter">{settlementPercentage}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* TRANSACTION LIST */}
      {/* Fixed: Scaled border radius and padding for mobile */}
      <div className="flex-1 bg-white rounded-[2rem] md:rounded-[3rem] shadow-sm border border-slate-100 flex flex-col min-h-[300px] sm:min-h-0 overflow-hidden">
        <div className="shrink-0 p-5 sm:p-6 border-b border-slate-50 bg-slate-50/20 flex justify-between items-center">
          <h3 className="font-black text-slate-800 flex items-center gap-2 sm:gap-3 uppercase text-[9px] sm:text-[10px] tracking-[0.1em] sm:tracking-[0.2em]">
            <Receipt size={16} className="text-indigo-600 sm:w-[18px] sm:h-[18px]" /> Digital Ledger Receipts
          </h3>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 space-y-3 sm:space-y-4">
          {feeData.transactions.length > 0 ? (
            feeData.transactions.map((txn, i) => (
              // Fixed: Switched from pure justify-between to flex-col on small screens, flex-row on larger screens
              <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 gap-4 rounded-2xl sm:rounded-[2rem] border border-transparent hover:border-slate-100 hover:bg-slate-50/30 transition-all group">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white shadow-sm text-emerald-500 rounded-xl sm:rounded-2xl flex items-center justify-center border border-slate-100 group-hover:scale-110 transition-transform duration-300 shrink-0">
                    <CheckCircle2 size={20} className="sm:w-6 sm:h-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-slate-800 text-xs sm:text-sm tracking-tight truncate">{txn.id}</p>
                    <p className="text-[9px] font-bold text-slate-400 mt-0.5 sm:mt-1 uppercase tracking-widest flex items-center gap-1.5 sm:gap-2">
                      {new Date(txn.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      <span className="w-1 h-1 bg-slate-200 rounded-full shrink-0"></span>
                      <span className="truncate">{txn.method}</span>
                    </p>
                  </div>
                </div>
                {/* Fixed: Inner wrapper ensures amount and button stay aligned correctly even when stacked on mobile */}
                <div className="flex items-center justify-between w-full sm:w-auto gap-4 sm:gap-6 pl-14 sm:pl-0">
                  <span className="font-black text-base sm:text-lg text-slate-900 tracking-tight">₹{txn.amount.toLocaleString()}</span>
                  <button className="p-2 sm:p-2.5 bg-slate-100 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg sm:rounded-xl transition-all shadow-sm shrink-0" title="Download PDF">
                    <Download size={16} className="sm:w-[18px] sm:h-[18px]" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center py-10 sm:py-12">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                <Receipt size={24} className="text-slate-200 sm:w-8 sm:h-8" />
              </div>
              <p className="font-black text-[9px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.2em] text-slate-300 text-center">No verified payments found</p>
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #E2E8F0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #6366F1; }
        @media (min-width: 640px) {
          .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        }
      `}} />
    </div>
  );
}