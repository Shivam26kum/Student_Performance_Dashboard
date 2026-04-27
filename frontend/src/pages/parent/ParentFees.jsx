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
    <div className="h-full flex flex-col max-w-6xl mx-auto overflow-hidden p-6 font-sans">
      
      {/* HEADER SECTION */}
      <div className="shrink-0 mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Financial Overview</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Review categorized dues and secure payment history.</p>
        </div>
        <div className="hidden md:flex items-center gap-3 bg-white border border-slate-200 px-4 py-2 rounded-2xl shadow-sm">
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Active Billing Cycle</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mb-10">
        {/* MAIN DUES CARD */}
        <div className="lg:col-span-2 bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between border border-slate-800">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          
          <div>
            <p className="text-[10px] text-indigo-300 font-black uppercase tracking-[0.2em] mb-4">Current Outstanding</p>
            <h2 className="text-7xl font-black mb-6 tracking-tighter">₹{feeData.dueFees.toLocaleString('en-IN')}</h2>
            
            {/* COMPONENT BREAKDOWN */}
            <div className="flex flex-wrap gap-3">
              <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-2">
                 <GraduationCap size={14} className="text-indigo-400" />
                 <span className="text-xs font-bold text-slate-300">Tuition: ₹{feeData.monthlyFee}</span>
              </div>
              {feeData.busFee > 0 && (
                <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-2">
                   <Bus size={14} className="text-emerald-400" />
                   <span className="text-xs font-bold text-slate-300">Transport: ₹{feeData.busFee}</span>
                </div>
              )}
              {feeData.otherFee > 0 && (
                <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-2">
                   <PlusCircle size={14} className="text-amber-400" />
                   <span className="text-xs font-bold text-slate-300">Misc: ₹{feeData.otherFee}</span>
                </div>
              )}
              {feeData.appliedPenalty > 0 && (
                <div className="bg-rose-500/20 border border-rose-500/30 px-4 py-2 rounded-xl flex items-center gap-2">
                   <Clock size={14} className="text-rose-400" />
                   <span className="text-xs font-bold text-rose-200 uppercase tracking-tighter font-black">Late Fee Applied</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3 text-slate-400">
              <AlertCircle size={18} className="text-amber-500" />
              <p className="text-[10px] font-black uppercase tracking-wider leading-relaxed">
                Grace period ends on the 7th. <br/>
                Next auto-penalty trigger: <span className="text-slate-200">8th of Current Month</span>
              </p>
            </div>
            {feeData.dueFees > 0 && (
              <button 
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full sm:w-auto bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-700 text-white px-10 py-5 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-500/20 transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <WalletCards size={18} />}
                Pay Now
              </button>
            )}
          </div>
        </div>

        {/* SETTLEMENT PROGRESS CARD */}
        <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 px-1">Payment Statistics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                <span className="text-xs font-bold text-slate-500">Total Billed</span>
                <span className="text-sm font-black text-slate-900">₹{feeData.totalFees.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-emerald-50 rounded-2xl border border-emerald-100/50">
                <span className="text-xs font-bold text-emerald-700">Amount Paid</span>
                <span className="text-sm font-black text-emerald-700">₹{feeData.paidFees.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <div className="w-full bg-slate-100 rounded-full h-2 mb-4 overflow-hidden">
              <div 
                className="bg-indigo-500 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
                style={{ width: `${settlementPercentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Clearance</span>
              <span className="text-lg font-black text-indigo-600 tracking-tighter">{settlementPercentage}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* TRANSACTION LIST */}
      <div className="flex-1 bg-white rounded-[3rem] shadow-sm border border-slate-100 flex flex-col min-h-0 overflow-hidden">
        <div className="shrink-0 p-6 border-b border-slate-50 bg-slate-50/20 flex justify-between items-center">
          <h3 className="font-black text-slate-800 flex items-center gap-3 uppercase text-[10px] tracking-[0.2em]">
            <Receipt size={18} className="text-indigo-600" /> Digital Ledger Receipts
          </h3>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
          {feeData.transactions.length > 0 ? (
            feeData.transactions.map((txn, i) => (
              <div key={i} className="flex items-center justify-between p-5 rounded-[2rem] border border-transparent hover:border-slate-100 hover:bg-slate-50/30 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white shadow-sm text-emerald-500 rounded-2xl flex items-center justify-center border border-slate-100 group-hover:scale-110 transition-transform duration-300">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <p className="font-black text-slate-800 text-sm tracking-tight">{txn.id}</p>
                    <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest flex items-center gap-2">
                      {new Date(txn.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                      {txn.method}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <span className="font-black text-lg text-slate-900 tracking-tight">₹{txn.amount.toLocaleString()}</span>
                  <button className="p-2.5 bg-slate-100 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all shadow-sm" title="Download PDF">
                    <Download size={18} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Receipt size={32} className="text-slate-200" />
              </div>
              <p className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-300">No verified payments found</p>
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #E2E8F0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #6366F1; }
      `}} />
    </div>
  );
}