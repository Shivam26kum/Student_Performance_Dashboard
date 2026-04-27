import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar";

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar stays fixed on the left */}
      <AdminSidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* This Main Content area scrolls independently */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet /> {/* This is where Dashboard, Classes, or Teachers will load */}
        </main>
      </div>
    </div>
  );
}