import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar, { SIDEBAR_W } from "./components/Sidebar";
import TopBar from "./components/TopBar";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Sidebar: fixed on desktop (always visible), slide-in drawer on mobile */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content area: full-width on mobile, offset by sidebar on desktop */}
      <div className="flex flex-col flex-1 min-w-0 lg:ml-[220px]">
        <TopBar onMenuToggle={() => setSidebarOpen(true)} />
        <Outlet />
      </div>
    </div>
  );
}

export default App;