import { Outlet } from "react-router-dom";
import ParentSidebar from "../components/parent/ParentSidebar";

export default function ParentLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar handles mobile drawer logic internally */}
      <ParentSidebar />

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Main Content Area:
            - pt-20: Clears the h-16 mobile header with a small gap.
            - md:pt-0: Removes the top padding when the sidebar is on the left.
        */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 pt-20 md:pt-0 overflow-y-auto custom-scrollbar transition-all duration-300">
          
          {/* Content Wrapper to maintain alignment */}
          <div className="max-w-6xl mx-auto h-full">
            <Outlet />
          </div>
          
        </main>
      </div>

      {/* Custom Scrollbar Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #e2e8f0; border-radius: 10px; }
      `}} />
    </div>
  );
}