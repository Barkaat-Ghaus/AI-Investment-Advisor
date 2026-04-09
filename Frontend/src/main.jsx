import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import AdvisorPage from "./pages/AdvisorPage.jsx";
import YourHome from "./pages/YourHome.jsx";
import MarketData from "./pages/MarketData.jsx";
import RiskAnalysis from "./pages/RiskAnalysis.jsx";
import FinanceGoal from "./pages/FinanceGoal.jsx";


createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Auth routes — rendered standalone, no layout shell */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* App shell routes — sidebar + topbar */}
        <Route path="/" element={<App />}>
          <Route index element={<Home />} />
          <Route path="advisor" element={<AdvisorPage />} />
          <Route path="home" element={<YourHome />} />
          <Route path="markets" element={<MarketData />} />
          <Route path="risk-analysis" element={<RiskAnalysis />} />
          <Route path="goals" element={<FinanceGoal />} />

        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
