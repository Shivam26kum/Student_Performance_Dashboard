import api from "./api";

// --- Dashboard & Analytics ---
export const getAdminStats = () => api.get("/api/admin/stats");

// --- Teachers ---
export const getAllTeachers = () => api.get("/api/admin/teachers");
// FIXED: Matched to standard REST route
export const createTeacher = (data) => api.post("/api/admin/teachers", data); 
export const updateTeacher = (id, data) => api.put(`/api/admin/teachers/${id}`, data);
export const deleteTeacher = (id) => api.delete(`/api/admin/teachers/${id}`);

// --- Students ---
// FIXED: Matched to standard REST route
export const createStudent = (data) => api.post("/api/admin/students", data);
export const addStudent = createStudent;
export const getAllStudents = () => api.get("/api/admin/students");
export const updateStudent = (id, data) => api.put(`/api/admin/students/${id}`, data);
export const deleteStudent = (id) => api.delete(`/api/admin/students/${id}`);
export const getStudentsByClass = (className) => api.get(`/api/admin/classes/${className}/students`);

// --- Classes & Fee Configuration ---
export const getClasses = () => api.get("/api/admin/classes");
export const createClass = (data) => api.post("/api/admin/classes", data);
export const deleteClass = (id) => api.delete(`/api/admin/classes/${id}`);
// FIXED: Updated to accept the full payload object (monthly, busFee, otherFee, penalty)
export const setClassFee = (id, payload) => api.put(`/api/admin/classes/${id}/set-fee`, payload);

// --- Schedules (Daily Different Routine) ---
// day is optional, if provided it fetches strictly for that day
export const getSchedules = (day = "") => api.get(`/api/admin/schedules${day ? `?day=${day}` : ""}`);
export const createSchedule = (data) => api.post("/api/admin/schedules", data);
export const deleteSchedule = (id) => api.delete(`/api/admin/schedules/${id}`);

// --- Notices ---
// FIXED: Matched to standard REST route
export const postNotice = (data) => api.post("/api/admin/notices", data);
export const getNotices = () => api.get("/api/admin/notices");
export const updateNotice = (id, data) => api.put(`/api/admin/notices/${id}`, data);
export const deleteNotice = (id) => api.delete(`/api/admin/notices/${id}`);

// --- Materials ---
export const getAllMaterials = () => api.get("/api/admin/materials");
export const deleteMaterial = (id) => api.delete(`/api/admin/materials/${id}`);

// --- Admin Profile ---
export const getAdminProfile = () => api.get("/api/admin/profile");
export const updateAdminProfile = (data) => api.put("/api/admin/profile", data);