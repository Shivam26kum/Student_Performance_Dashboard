import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar";

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar handles its own fixed/static logic for mobile/desktop */}
      <AdminSidebar />

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Main Content Area:
          - pt-20: Adds 80px top padding on mobile to clear the fixed 'Admin Panel' bar (h-16).
          - md:pt-0: Removes that padding on desktop since the sidebar is on the left.
          - bg-gray-50: A slightly softer background for a premium dashboard feel.
        */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 pt-20 md:pt-0 overflow-y-auto custom-scrollbar transition-all duration-300">
          
          {/* Max-width wrapper to keep dashboard content aligned on ultra-wide monitors */}
          <div className="max-w-7xl mx-auto">
            <Outlet /> 
          </div>
          
        </main>
      </div>

      {/* Optional: Global scrollbar styling for the main content area */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #e2e8f0; border-radius: 10px; }
      `}} />
    </div>
  );
}