import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import LandingPage from "./pages/Landingpage.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import AdvisorPage from "./pages/AdvisorPage.jsx";
import YourHome from "./pages/YourHome.jsx";
import MarketData from "./pages/MarketData.jsx";
import RiskAnalysis from "./pages/RiskAnalysis.jsx";
import FinanceGoal from "./pages/FinanceGoal.jsx";
import ProfileQuestion from "./pages/ProfileQuestion.jsx";
import Profile from "./pages/Profile.jsx";
import AdvisoryHistoryPage from "./pages/AdvisoryHistoryPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";


createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Public landing page at root */}
        <Route path="/" element={<LandingPage />} />
        {/* backward-compat redirect */}
        <Route path="/landing" element={<Navigate to="/" replace />} />

        {/* Auth routes — standalone, no layout shell */}
        <Route path="/login"  element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* App shell routes — sidebar + topbar — all protected */}
        <Route
          element={
            <ProtectedRoute>
              <App />
            </ProtectedRoute>
          }
        >
          <Route path="home"             element={<YourHome />} />
          <Route path="advisor"          element={<AdvisorPage />} />
          <Route path="markets"          element={<MarketData />} />
          <Route path="risk-analysis"    element={<RiskAnalysis />} />
          <Route path="goals"            element={<FinanceGoal />} />
          <Route path="profile-setup"    element={<ProfileQuestion />} />
          <Route path="profile"          element={<Profile />} />
          <Route path="advisory-history" element={<AdvisoryHistoryPage />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
