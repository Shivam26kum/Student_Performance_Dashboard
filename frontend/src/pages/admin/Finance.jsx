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
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <IndianRupee className="text-emerald-600" /> Finance Department
      </h2>

      {/* TABS */}
      <div className="flex gap-4 mb-8 border-b border-gray-200">
        {["fees", "salary", "history"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 px-4 font-medium capitalize transition-colors ${
              activeTab === tab 
                ? "border-b-2 border-indigo-600 text-indigo-600" 
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* --- TAB 1: FEES --- */}
      {activeTab === "fees" && (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Collect Fees</h3>
            <form onSubmit={handleCollectFee} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Select Student</label>
                <select 
                  className="w-full border p-2 rounded-lg"
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
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <input 
                  type="number" required
                  className="w-full border p-2 rounded-lg"
                  placeholder="5000"
                  value={feeForm.amount}
                  onChange={e => setFeeForm({...feeForm, amount: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <input 
                  type="text" 
                  className="w-full border p-2 rounded-lg"
                  placeholder="Tuition Fee - Term 1"
                  value={feeForm.description}
                  onChange={e => setFeeForm({...feeForm, description: e.target.value})}
                />
              </div>
              <button type="submit" className="w-full bg-emerald-600 text-white py-2 rounded-lg font-bold hover:bg-emerald-700">
                Collect Payment
              </button>
            </form>
          </div>

          {/* Pending List (Simple View) */}
          <div className="bg-white p-6 rounded-xl shadow-sm border overflow-y-auto max-h-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Student Balances</h3>
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-2">Name</th>
                  <th className="p-2">Paid</th>
                  <th className="p-2">Pending</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s._id} className="border-b">
                    <td className="p-2 font-medium">{s.name}</td>
                    <td className="p-2 text-emerald-600 font-bold">${s.feesPaid}</td>
                    <td className="p-2 text-red-500 font-bold">${s.feesTotal - s.feesPaid}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 2: SALARY --- */}
      {activeTab === "salary" && (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Process Salary</h3>
            <form onSubmit={handlePaySalary} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Select Teacher</label>
                <select 
                  className="w-full border p-2 rounded-lg"
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
              <div>
                <label className="block text-sm font-medium text-gray-700">Month</label>
                <select 
                  className="w-full border p-2 rounded-lg"
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
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <input 
                  type="number" required
                  className="w-full border p-2 rounded-lg"
                  placeholder="35000"
                  value={salaryForm.amount}
                  onChange={e => setSalaryForm({...salaryForm, amount: e.target.value})}
                />
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold hover:bg-indigo-700">
                Confirm Payment
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- TAB 3: HISTORY --- */}
      {activeTab === "history" && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-sm text-gray-600">Date</th>
                <th className="p-4 text-sm text-gray-600">Type</th>
                <th className="p-4 text-sm text-gray-600">Description</th>
                <th className="p-4 text-sm text-gray-600 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {transactions.map((t) => (
                <tr key={t._id}>
                  <td className="p-4 text-sm text-gray-500">{new Date(t.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      t.type === "Income" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                    }`}>
                      {t.category}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-800">{t.description}</td>
                  <td className={`p-4 text-sm font-bold text-right ${
                    t.type === "Income" ? "text-emerald-600" : "text-red-600"
                  }`}>
                    {t.type === "Income" ? "+" : "-"}${t.amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}