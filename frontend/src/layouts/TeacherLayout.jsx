import { Outlet } from "react-router-dom";
import TeacherSidebar from "../components/teacher/TeacherSidebar";

export default function TeacherLayout() {
  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden">
      <TeacherSidebar />

      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        
        {/* Mobile: This main tag scrolls. Desktop: locks height so internal cards scroll */}
        <main className="flex-1 w-full h-full overflow-y-auto lg:overflow-hidden custom-scrollbar">
          
          {/* CRITICAL FIX: min-h-full allows the page to stretch naturally on mobile. 
              lg:h-full locks it back to the screen height on desktop. */}
          <div className="max-w-7xl mx-auto w-full h-auto min-h-full lg:h-full flex flex-col p-4 pt-24 sm:p-6 sm:pt-24 lg:p-8">
            <Outlet /> 
          </div>
          
        </main>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
      `}} />
    </div>
  );
}