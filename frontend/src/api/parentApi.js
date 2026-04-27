import api from "./api"; // Ensure this points to your configured Axios instance

// --- PARENT PORTAL API SERVICES ---

/**
 * Fetches the high-level overview data for the Parent Dashboard.
 * Includes student info, attendance %, recent performance, notices, and today's schedule.
 */
export const getParentDashboardData = async () => {
  return await api.get("/api/parent/dashboard");
};

/**
 * Fetches detailed attendance records for the student.
 * Optional: Pass params to filter (e.g., { startDate: '2026-04-01', endDate: '2026-04-30' })
 */
export const getParentAttendanceData = async (params = {}) => {
  return await api.get("/api/parent/attendance", { params });
};

/**
 * Fetches fee details including total, paid, due amounts, and transaction history.
 */
export const getParentFeesData = async () => {
  return await api.get("/api/parent/fees");
};

/**
 * Fetches the static profile details of the student and the primary guardian.
 */
export const getParentProfileData = async () => {
  return await api.get("/api/parent/profile");
};

// --- NEW SERVICES ---

/**
 * Fetches exam records, report cards, and historical test scores.
 */
export const getParentExamsData = async () => {
  return await api.get("/api/parent/exams");
};

/**
 * Fetches the student's full weekly or daily timetable.
 */
export const getParentScheduleData = async () => {
  return await api.get("/api/parent/schedule");
};

/**
 * Fetches all school and teacher notices relevant to the parent/student.
 */
export const getParentNoticesData = async () => {
  return await api.get("/api/parent/notices");
};