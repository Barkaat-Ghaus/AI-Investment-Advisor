import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";

export const SIDEBAR_W = 220;

function App() {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0" style={{ marginLeft: SIDEBAR_W }}>
        <TopBar />
        <Outlet />
      </div>
    </div>
  );
}

export default App;