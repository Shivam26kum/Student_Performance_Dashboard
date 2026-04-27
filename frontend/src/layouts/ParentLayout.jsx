import { Outlet } from "react-router-dom";
import ParentSidebar from "../components/parent/ParentSidebar";

export default function ParentLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <ParentSidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}