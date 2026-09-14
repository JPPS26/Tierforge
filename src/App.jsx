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

          {/* O Meu Perfil (requer login) */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Perfil Público Partilhável com #handle (ex: /profile/rodrigomatos) */}
          <Route path="/profile/:handle" element={<Profile />} />

          {/* Criação de Tier Lists (aberto e acessível do zero) */}
          <Route path="/create" element={<Builder />} />
        </Routes>
      </div>

      {/* Rodapé Premium Multilingue */}
      <footer className="border-t border-border bg-surface/50 px-4 sm:px-6 py-8 mt-16 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-4 text-[13px] text-mutedDim">
          <div className="flex items-center gap-2">
            <span className="font-display font-black text-white">TierForge</span>
            <span>—</span>
            <span>{t("footer.tagline")}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-semibold text-muted">{t("footer.language")}</span>
              <LanguageSelector compact />
            </div>
            <span className="text-[12px]">© {new Date().getFullYear()} {t("footer.rights")}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
