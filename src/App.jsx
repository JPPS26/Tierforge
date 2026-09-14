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
import InSiteNotificationToast from "./components/InSiteNotificationToast";
import Footer from "./components/Footer";
import BackToTop from "./components/BackToTop";

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

          {/* Criação e Edição de Tier Lists (Apenas com Conta) */}
          <Route
            path="/create"
            element={
              <ProtectedRoute>
                <Builder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit/:id"
            element={
              <ProtectedRoute>
                <Builder />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>

      {/* Rodapé Premium TierWorld */}
      <Footer />

      {/* Notificações no Próprio Site (Toasts Flutuantes) */}
      <InSiteNotificationToast />

      {/* Botão Flutuante de Voltar para Cima */}
      <BackToTop />
    </div>
  );
}
