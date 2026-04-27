import { useState, useEffect } from "react";
import { getParentExamsData } from "../../api/parentApi";
import { Award, BookOpen } from "lucide-react";

export default function ParentExams() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [examsData, setExamsData] = useState([]);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const { data } = await getParentExamsData();
        setExamsData(data);
      } catch (err) {
        setError("Unable to load exam records.");
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  const getGradeBadge = (percentage) => {
    if (percentage >= 90) return "bg-green-100 text-green-700";
    if (percentage >= 75) return "bg-blue-100 text-blue-700";
    if (percentage >= 60) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  if (loading) return <PageSkeleton />;
  if (error || examsData.length === 0) return <EmptyState message={error || "No exam records found."} icon={<Award size={48} />} />;

  return (
    <div className="h-full flex flex-col max-w-6xl mx-auto overflow-hidden p-4 font-sans">
      <div className="shrink-0 bg-white p-6 rounded-xl shadow-sm mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Award className="text-indigo-600" /> Exam Records
        </h2>
        <p className="text-sm font-medium text-gray-500 mt-1">View your child's academic performance across all terms.</p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 pb-4">
        {examsData.map((exam, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Exam Header */}
            <div className="p-6 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-bold text-gray-800">{exam.examName}</h3>
                <p className="text-xs font-bold text-gray-500 uppercase mt-1">
                  {new Date(exam.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center gap-4 bg-white p-3 rounded-xl shadow-sm">
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Overall Score</p>
                  <p className="text-sm font-bold text-gray-800">{exam.totalScore} / {exam.maxPossible}</p>
                </div>
                <div className={`px-4 py-2 rounded-lg font-bold text-sm ${getGradeBadge(exam.percentage)}`}>
                  {exam.percentage}%
                </div>
              </div>
            </div>

            {/* Subject Breakdown */}
            <div className="p-2">
              <table className="w-full text-left">
                <thead className="text-[10px] font-bold uppercase text-gray-400">
                  <tr>
                    <th className="p-4">Subject</th>
                    <th className="p-4 text-center">Marks Obtained</th>
                    <th className="p-4 text-center">Total Marks</th>
                    <th className="p-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {exam.subjects.map((sub, j) => {
                    const pass = (sub.marksObtained / sub.totalMarks) >= 0.35; // 35% passing criteria
                    return (
                      <tr key={j} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-semibold text-gray-700 flex items-center gap-3">
                          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><BookOpen size={16} /></div>
                          {sub.subject}
                        </td>
                        <td className="p-4 text-center font-bold text-gray-800">{sub.marksObtained}</td>
                        <td className="p-4 text-center font-bold text-gray-400">{sub.totalMarks}</td>
                        <td className="p-4 text-right">
                           <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${pass ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                             {pass ? 'Pass' : 'Fail'}
                           </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- HELPER COMPONENTS ---

function PageSkeleton() {
  return (
    <div className="max-w-6xl mx-auto p-4 animate-pulse h-full overflow-hidden flex flex-col gap-4">
      <div className="shrink-0 h-32 bg-gray-200 rounded-xl"></div>
      <div className="flex-1 bg-gray-200 rounded-xl min-h-0"></div>
    </div>
  );
}

function EmptyState({ message, icon, isChild = false }) {
  return (
    <div className={`flex flex-col items-center justify-center text-gray-400 py-20 ${isChild ? 'h-full bg-white rounded-xl shadow-sm' : 'h-[calc(100vh-10rem)]'}`}>
      <div className="mb-4 opacity-50 text-gray-300">{icon}</div>
      <p className="font-bold text-gray-500">{message}</p>
    </div>
  );
}