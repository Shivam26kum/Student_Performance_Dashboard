import api from "./api";

// --- DASHBOARD ---
export const getDashboardStats = (params) => api.get("/api/teacher/stats", { params });
export const getMyClasses = () => api.get("/api/teacher/my-classes");

// --- STUDENTS ---
export const getMyStudents = () => api.get("/api/teacher/students");
export const addStudent = (data) => api.post("/api/teacher/create-student", data);
export const addParent = (data) => api.post("/api/teacher/create-parent", data);
export const updateParent = (id, data) => api.put(`/api/teacher/parent/${id}`, data);
export const deleteStudent = (id) => api.delete(`/api/teacher/student/${id}`);

// --- ATTENDANCE ---
export const submitAttendance = (data) => api.post("/api/teacher/mark-attendance", data);

// Fetches attendance for a specific date and subject
export const getAttendanceByDate = (date, subject) => {
  const url = `/api/teacher/attendance/${date}${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`;
  return api.get(url);
};

// Fetches range report for Preview and Excel Export
export const getAttendanceReport = (startDate, endDate, subject) => {
  let url = `/api/teacher/attendance-report?startDate=${startDate}&endDate=${endDate}`;
  if (subject) {
    url += `&subject=${encodeURIComponent(subject)}`;
  }
  return api.get(url);
};

// --- EXAMS & PERFORMANCE ---
export const submitPerformance = (data) => api.post("/api/teacher/submit-performance", data);
export const getPerformance = (params) => api.get("/api/teacher/get-performance", { params });
export const getClassExams = (params) => api.get("/api/teacher/class-exams", { params });
export const deleteExamRecord = (params) => api.delete("/api/teacher/delete-performance", { params });

// --- CLASS ROUTINE (NEW) ---
export const getTeacherSchedule = () => api.get("/api/teacher/my-schedule");

// --- STUDY MATERIALS (NEW) ---
export const getStudyMaterials = () => api.get("/api/teacher/materials");
export const uploadMaterial = (data) => api.post("/api/teacher/create-material", data);

// --- NOTICE BOARD ---
export const getTeacherNotices = () => api.get("/api/teacher/notices");
export const postNoticeByTeacher = (data) => api.post("/api/teacher/create-notice", data);
export const deleteNotice = (id) => api.delete(`/api/teacher/notice/${id}`);

// --- TEACHER PROFILE (NEW) ---
export const getTeacherProfile = () => api.get("/api/teacher/profile");
export const updateTeacherProfile = (data) => api.put("/api/teacher/profile/update", data);