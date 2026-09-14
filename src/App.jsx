import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import Categories from "./pages/Categories";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Builder from "./pages/Builder";
import TierListView from "./pages/TierListView";
import { useLanguage } from "./context/LanguageContext";
import LanguageSelector from "./components/LanguageSelector";

export default function App() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-bg text-text">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create"
          element={
            <ProtectedRoute>
              <Builder />
            </ProtectedRoute>
          }
        />
      </Routes>
      <footer className="border-t border-border px-6 py-8 text-center text-[12.5px] text-mutedDim">
        TierForge — rank everything, argue respectfully.
    <div className="min-h-screen bg-bg text-text flex flex-col justify-between">
      <div>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/tier-list/:id" element={<TierListView />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          {/* O Builder é acessível diretamente para qualquer utilizador começar a criar a sua tier list do zero! */}
          <Route path="/create" element={<Builder />} />
        </Routes>
      </div>

      <footer className="border-t border-border bg-surface/60 px-6 py-8">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-4 text-[13px] text-mutedDim">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-text">TierForge</span>
            <span>—</span>
            <span>{t("footer.tagline")}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-muted">{t("footer.language")}</span>
              <LanguageSelector compact />
            </div>
            <span>© {new Date().getFullYear()} {t("footer.rights")}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
