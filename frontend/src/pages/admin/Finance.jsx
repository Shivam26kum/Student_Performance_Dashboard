import { useEffect, useState } from "react";
import { getAllStudents, getAllTeachers } from "../../api/adminApi";
import api from "../../api/api"; // Your Axios instance
import { User, Calendar, History, CheckCircle, IndianRupee } from "lucide-react";

export default function Finance() {
  const [activeTab, setActiveTab] = useState("fees"); // fees, salary, history
  
  // Data States
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Forms
  const [feeForm, setFeeForm] = useState({ studentId: "", amount: "", description: "" });
  const [salaryForm, setSalaryForm] = useState({ teacherId: "", amount: "", month: "" });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const sRes = await getAllStudents();
      const tRes = await getAllTeachers();
      const hRes = await api.get("/admin/finance/history"); // Helper fetch
      
      setStudents(sRes.data);
      setTeachers(tRes.data);
      setTransactions(hRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- ACTIONS ---
  const handleCollectFee = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/finance/fee", feeForm);
      alert("Fee Collected!");
      setFeeForm({ studentId: "", amount: "", description: "" });
      fetchData(); // Refresh data
    } catch (err) {
      alert("Failed to collect fee");
    }
  };

  const handlePaySalary = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/finance/salary", salaryForm);
      alert("Salary Processed!");
      setSalaryForm({ teacherId: "", amount: "", month: "" });
      fetchData();
    } catch (err) {
      alert("Failed to pay salary");
    }
  };

  return (
    // Fixed: Added wrapper padding for mobile screens
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 font-sans">
      <h2 className="text-xl sm:text-2xl font-black text-gray-800 mb-6 md:mb-8 flex items-center gap-2 md:gap-3">
        <div className="bg-emerald-50 p-1.5 md:p-2 rounded-xl text-emerald-600 shadow-sm shrink-0">
          <IndianRupee className="w-5 h-5 md:w-6 md:h-6" />
        </div>
        Finance Department
      </h2>

      {/* TABS */}
      {/* Fixed: Made tabs scrollable horizontally on small screens */}
      <div className="flex gap-2 sm:gap-4 mb-6 md:mb-8 border-b border-gray-200 overflow-x-auto custom-scrollbar pb-1">
        {["fees", "salary", "history"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-3 sm:px-4 font-bold text-sm capitalize transition-all whitespace-nowrap shrink-0 ${
              activeTab === tab 
                ? "border-b-2 border-indigo-600 text-indigo-600" 
                : "text-gray-500 hover:text-gray-800 border-b-2 border-transparent"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* --- TAB 1: FEES --- */}
      {activeTab === "fees" && (
        // Fixed: Stack to 1 column on mobile, 2 columns on desktop
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <div className="bg-white p-5 sm:p-6 rounded-[1.5rem] shadow-sm border border-gray-100 flex flex-col">
            <h3 className="text-lg font-bold text-gray-800 mb-5">Collect Fees</h3>
            <form onSubmit={handleCollectFee} className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Select Student</label>
                <select 
                  className="w-full bg-gray-50 border-none ring-1 ring-gray-200 p-3.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer"
                  value={feeForm.studentId}
                  onChange={e => setFeeForm({...feeForm, studentId: e.target.value})}
                  required
                >
                  <option value="">-- Select Student --</option>
                  {students.map(s => (
                    <option key={s._id} value={s._id}>{s.name} (Roll: {s.rollNo})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Amount</label>
                <div className="relative">
                  <IndianRupee size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="number" required
                    className="w-full bg-gray-50 border-none ring-1 ring-gray-200 p-3.5 pl-10 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="5000"
                    value={feeForm.amount}
                    onChange={e => setFeeForm({...feeForm, amount: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Description</label>
                <input 
                  type="text" 
                  className="w-full bg-gray-50 border-none ring-1 ring-gray-200 p-3.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="Tuition Fee - Term 1"
                  value={feeForm.description}
                  onChange={e => setFeeForm({...feeForm, description: e.target.value})}
                />
              </div>
              <button type="submit" className="w-full mt-2 bg-emerald-600 text-white py-3.5 rounded-xl font-bold hover:bg-emerald-700 shadow-sm transition-all active:scale-95">
                Collect Payment
              </button>
            </form>
          </div>

          {/* Pending List */}
          {/* Fixed: Safe height (h-[400px]), flex layout, and inner table overflow */}
          <div className="bg-white p-5 sm:p-6 rounded-[1.5rem] shadow-sm border border-gray-100 flex flex-col h-[400px] sm:h-[450px]">
            <h3 className="text-lg font-bold text-gray-800 mb-4 shrink-0">Student Balances</h3>
            <div className="overflow-x-auto overflow-y-auto flex-1 custom-scrollbar">
              <table className="w-full text-left text-sm min-w-[300px]">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="p-3 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Name</th>
                    <th className="p-3 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Paid</th>
                    <th className="p-3 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Pending</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {students.map(s => (
                    <tr key={s._id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-3 font-medium text-gray-800 whitespace-nowrap">{s.name}</td>
                      {/* Fixed: Swapped $ to ₹ for consistency with icons */}
                      <td className="p-3 text-emerald-600 font-bold whitespace-nowrap">₹{s.feesPaid || 0}</td>
                      <td className="p-3 text-rose-500 font-bold whitespace-nowrap">₹{(s.feesTotal || 0) - (s.feesPaid || 0)}</td>
                    </tr>
                  ))}
                  {students.length === 0 && !loading && (
                    <tr>
                      <td colSpan="3" className="p-8 text-center text-gray-400 text-xs">No student data available.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: SALARY --- */}
      {activeTab === "salary" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <div className="bg-white p-5 sm:p-6 rounded-[1.5rem] shadow-sm border border-gray-100 flex flex-col">
            <h3 className="text-lg font-bold text-gray-800 mb-5">Process Salary</h3>
            <form onSubmit={handlePaySalary} className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Select Teacher</label>
                <select 
                  className="w-full bg-gray-50 border-none ring-1 ring-gray-200 p-3.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer"
                  value={salaryForm.teacherId}
                  onChange={e => setSalaryForm({...salaryForm, teacherId: e.target.value})}
                  required
                >
                  <option value="">-- Select Teacher --</option>
                  {teachers.map(t => (
                    <option key={t._id} value={t._id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Month</label>
                  <select 
                    className="w-full bg-gray-50 border-none ring-1 ring-gray-200 p-3.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer"
                    value={salaryForm.month}
                    onChange={e => setSalaryForm({...salaryForm, month: e.target.value})}
                    required
                  >
                    <option value="">-- Select Month --</option>
                    {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Amount</label>
                  <div className="relative">
                    <IndianRupee size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="number" required
                      className="w-full bg-gray-50 border-none ring-1 ring-gray-200 p-3.5 pl-10 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      placeholder="35000"
                      value={salaryForm.amount}
                      onChange={e => setSalaryForm({...salaryForm, amount: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              <button type="submit" className="w-full mt-2 bg-indigo-600 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-700 shadow-sm transition-all active:scale-95">
                Confirm Payment
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- TAB 3: HISTORY --- */}
      {activeTab === "history" && (
        // Fixed: Added overflow-x-auto wrapper and min-width to prevent mobile crushing
        <div className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left min-w-[600px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Date</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Type</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Description</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right whitespace-nowrap">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {transactions.length > 0 ? (
                  transactions.map((t) => (
                    <tr key={t._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 text-sm text-gray-500 whitespace-nowrap font-medium">
                        {new Date(t.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                          t.type === "Income" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"
                        }`}>
                          {t.category}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-800 font-medium whitespace-nowrap">
                        {t.description}
                      </td>
                      <td className={`p-4 text-sm font-black text-right whitespace-nowrap ${
                        t.type === "Income" ? "text-emerald-500" : "text-rose-500"
                      }`}>
                        {t.type === "Income" ? "+" : "-"}₹{t.amount}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-12 text-center text-gray-400 text-sm">
                      <History size={32} className="mx-auto mb-3 opacity-20" />
                      No transaction history found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Global Custom Scrollbar Styling */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #e2e8f0; border-radius: 10px; }
      `}} />
    </div>
  );
}