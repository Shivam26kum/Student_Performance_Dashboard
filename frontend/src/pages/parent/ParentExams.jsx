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
    if (percentage >= 90) return "bg-green-100 text-green-700 border-green-200";
    if (percentage >= 75) return "bg-blue-100 text-blue-700 border-blue-200";
    if (percentage >= 60) return "bg-yellow-100 text-yellow-700 border-yellow-200";
    return "bg-red-100 text-red-700 border-red-200";
  };

  if (loading) return <PageSkeleton />;
  if (error || examsData.length === 0) return <EmptyState message={error || "No exam records found."} icon={<Award size={48} />} />;

  return (
    // Fixed: Added responsive padding to the main wrapper
    <div className="h-full flex flex-col max-w-6xl mx-auto overflow-hidden p-4 sm:p-6 lg:p-8 font-sans">
      
      {/* Fixed: Adjusted padding for mobile and added a subtle border */}
      <div className="shrink-0 bg-white p-4 sm:p-6 rounded-2xl shadow-sm mb-4 sm:mb-6 border border-gray-100">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2 sm:gap-3">
          <Award className="text-indigo-600 sm:w-7 sm:h-7" /> Exam Records
        </h2>
        <p className="text-xs sm:text-sm font-medium text-gray-500 mt-1">View your child's academic performance across all terms.</p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 sm:space-y-6 pb-4 sm:pr-2">
        {examsData.map((exam, i) => (
          // Fixed: Added border for better definition on lighter backgrounds
          <div key={i} className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 overflow-hidden">
            
            {/* Exam Header */}
            <div className="p-4 sm:p-6 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800">{exam.examName}</h3>
                <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase mt-1 tracking-wider">
                  {new Date(exam.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              </div>
              
              {/* Fixed: Score card stretches to full width on mobile and justifies content securely */}
              <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-3 sm:gap-4 bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="text-right">
                  <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider">Overall Score</p>
                  <p className="text-sm sm:text-base font-black text-gray-800">{exam.totalScore} <span className="text-gray-400 font-medium">/ {exam.maxPossible}</span></p>
                </div>
                <div className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-bold text-sm sm:text-base border ${getGradeBadge(exam.percentage)}`}>
                  {exam.percentage}%
                </div>
              </div>
            </div>

            {/* Subject Breakdown */}
            {/* Fixed: Added overflow-x-auto and min-width to prevent table crushing */}
            <div className="p-0 sm:p-2 overflow-x-auto custom-scrollbar w-full">
              <table className="w-full text-left min-w-[500px]">
                <thead className="text-[10px] font-bold uppercase text-gray-400 bg-white sticky top-0">
                  <tr>
                    <th className="p-4 tracking-wider whitespace-nowrap">Subject</th>
                    <th className="p-4 text-center tracking-wider whitespace-nowrap">Marks Obtained</th>
                    <th className="p-4 text-center tracking-wider whitespace-nowrap">Total Marks</th>
                    <th className="p-4 text-right tracking-wider whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {exam.subjects.map((sub, j) => {
                    const pass = (sub.marksObtained / sub.totalMarks) >= 0.35; // 35% passing criteria
                    return (
                      <tr key={j} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4 font-bold text-sm text-gray-700 flex items-center gap-3 whitespace-nowrap">
                          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                            <BookOpen size={16} />
                          </div>
                          {sub.subject}
                        </td>
                        <td className="p-4 text-center font-black text-gray-800 text-sm whitespace-nowrap">{sub.marksObtained}</td>
                        <td className="p-4 text-center font-bold text-gray-400 text-sm whitespace-nowrap">{sub.totalMarks}</td>
                        <td className="p-4 text-right whitespace-nowrap">
                           <span className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest border inline-block ${pass ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
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

      {/* Global Custom Scrollbar Styling */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #e2e8f0; border-radius: 10px; }
      `}} />
    </div>
  );
}

// --- HELPER COMPONENTS ---

function PageSkeleton() {
  return (
    // Fixed: Matches the responsive layout padding
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 animate-pulse h-full overflow-hidden flex flex-col gap-4 sm:gap-6 w-full">
      <div className="shrink-0 h-24 sm:h-32 bg-gray-200 rounded-2xl w-full"></div>
      <div className="flex-1 bg-gray-200 rounded-[1.5rem] min-h-0 w-full"></div>
    </div>
  );
}

function EmptyState({ message, icon, isChild = false }) {
  return (
    <div className={`flex flex-col items-center justify-center text-gray-400 py-20 px-4 text-center w-full ${isChild ? 'h-full bg-white rounded-2xl shadow-sm border border-gray-100' : 'h-[calc(100vh-10rem)]'}`}>
      <div className="mb-4 opacity-30 text-gray-400">{icon}</div>
      <p className="font-bold text-gray-500 uppercase tracking-widest text-sm">{message}</p>
    </div>
  );
}