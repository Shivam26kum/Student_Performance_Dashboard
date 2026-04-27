import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import PrivateRoute from "./routes/PrivateRoute";
import AdminRoutes from "./routes/AdminRoutes"; 
import TeacherRoutes from "./routes/TeacherRoutes";
import ParentRoutes from "./routes/ParentRoutes";
import Finance from "./pages/admin/Finance";
import { ToasterProvider } from 'react-toastella';

function App() {
  return (
    <ToasterProvider>
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      {/* --- ADMIN ROUTES FIX --- */}
      {/* We hand off control to AdminRoutes.jsx for anything starting with /admin */}
      <Route
        path="/admin/*"
        element={
          <PrivateRoute allowedRoles={["admin"]}>
            <AdminRoutes /> {/* <--- THIS IS THE KEY FIX */}
          </PrivateRoute>
        }
      />

      {/* Teacher */}
      <Route
        path="/teacher/*"
        element={
          <PrivateRoute allowedRoles={["teacher"]}>
            <TeacherRoutes /> {/* <--- THIS IS THE KEY FIX */}
          </PrivateRoute>
        }
      />

      {/* Parent */}
      <Route
        path="/parent/*"
        element={
          <PrivateRoute allowedRoles={["parent"]}>
            <ParentRoutes /> {/* <--- THIS IS THE KEY FIX */}
          </PrivateRoute>
        }
      />
    </Routes>
    </ToasterProvider>
  );
}

export default App;