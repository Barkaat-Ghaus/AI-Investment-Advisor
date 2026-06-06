import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar, { SIDEBAR_W } from "./components/Sidebar";
import TopBar from "./components/TopBar";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* lg:ml-[240px] matches SIDEBAR_W exactly */}
      <div className="flex flex-col flex-1 min-w-0 lg:ml-[240px]">
        <TopBar onMenuToggle={() => setSidebarOpen(true)} />
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default App;