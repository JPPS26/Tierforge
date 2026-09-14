import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Plus, Bell, ChevronDown, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { Avatar, PrimaryButton, GhostButton } from "./UI";
import LanguageSelector from "./LanguageSelector";

export default function Navbar() {
  const { user, profile, logout } = useAuth();
  const { t } = useLanguage();
  const [q, setQ] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    setMenuOpen(false);
    navigate("/");
  }

  function handleSearchSubmit(e) {
    if (e.key === "Enter" && q.trim()) {
      navigate(`/explore?search=${encodeURIComponent(q.trim())}`);
    }
  }

  return (
    <div className="sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-[68px] max-w-[1240px] items-center gap-7 px-6">
        <Link to="/" className="flex flex-shrink-0 items-center gap-2">
    <div className="sticky top-0 z-40 border-b border-border bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-[68px] max-w-[1240px] items-center gap-5 sm:gap-7 px-4 sm:px-6">
        {/* Logótipo */}
        <Link to="/" className="flex flex-shrink-0 items-center gap-2.5">
          <div
            className="flex h-[30px] w-[30px] items-center justify-center rounded-[9px]"
            className="flex h-[32px] w-[32px] items-center justify-center rounded-[10px] shadow-glow"
            style={{
              background: "linear-gradient(135deg,#9A7CFF,#6A46F0)",
              boxShadow: "0 0 22px rgba(124,92,255,0.5)",
              background: "linear-gradient(135deg, #9A7CFF, #6A46F0)",
            }}
          >
            <span className="font-display text-[15px] font-extrabold text-[#0A0A0D]">T</span>
            <span className="font-display text-[16px] font-extrabold text-[#0A0A0D]">T</span>
          </div>
          <span className="font-display text-[18px] font-bold tracking-tight">TierForge</span>
          <span className="font-display text-[19px] font-black tracking-tight text-white">
            {t("nav.brand")}
          </span>
        </Link>

        {/* Links de Navegação */}
        <div className="hidden gap-1 md:flex">
          <Link to="/explore" className="rounded-lg px-3 py-2 text-[14.5px] font-medium text-muted hover:text-text">
            Explore
          <Link
            to="/explore"
            className="rounded-lg px-3 py-2 text-[14px] font-semibold text-muted hover:text-text transition-colors"
          >
            {t("nav.explore")}
          </Link>
          <Link to="/categories" className="rounded-lg px-3 py-2 text-[14.5px] font-medium text-muted hover:text-text">
            Categories
          <Link
            to="/categories"
            className="rounded-lg px-3 py-2 text-[14px] font-semibold text-muted hover:text-text transition-colors"
          >
            {t("nav.categories")}
          </Link>
          <Link to="/leaderboard" className="rounded-lg px-3 py-2 text-[14.5px] font-medium text-muted hover:text-text">
            Leaderboard
          <Link
            to="/leaderboard"
            className="rounded-lg px-3 py-2 text-[14px] font-semibold text-muted hover:text-text transition-colors"
          >
            {t("nav.leaderboard")}
          </Link>
        </div>

        <div className="relative hidden max-w-[420px] flex-1 md:block">
          <Search size={16} className="absolute left-3 top-[11px] text-mutedDim" />
        {/* Barra de Pesquisa */}
        <div className="relative hidden max-w-[360px] flex-1 lg:block">
          <Search size={15} className="absolute left-3.5 top-[11px] text-mutedDim" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search tier lists, players, games…"
            className="w-full rounded-[11px] border border-border bg-surface py-2.5 pl-9 pr-3.5 text-[13.5px] text-text outline-none focus:border-[rgba(124,92,255,0.5)]"
            onKeyDown={handleSearchSubmit}
            placeholder={t("nav.searchPlaceholder")}
            className="w-full rounded-xl border border-border bg-surface py-2 pl-9 pr-3.5 text-[13px] text-text outline-none transition-colors focus:border-accent"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
        {/* Ações da Direita: Seletor de Idioma + Criar + Login/Perfil */}
        <div className="ml-auto flex items-center gap-3">
          {/* Seletor de Idioma */}
          <LanguageSelector />

          {/* Botão Criar Tier List */}
          <PrimaryButton small icon={Plus} onClick={() => navigate("/create")}>
            <span className="hidden sm:inline">{t("nav.create")}</span>
            <span className="sm:hidden">Criar</span>
          </PrimaryButton>

          {/* Autenticação / Perfil */}
          {user ? (
            <>
              <div className="hidden items-center gap-2 md:flex">
                <PrimaryButton small icon={Plus} onClick={() => navigate("/create")}>
                  Create
                </PrimaryButton>
                <button className="flex h-[38px] w-[38px] items-center justify-center rounded-[11px] text-muted hover:bg-surface2">
                  <Bell size={18} />
                </button>
              </div>
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-1.5"
                >
                  <Avatar name={profile?.displayName || user.email} size={34} />
                  <ChevronDown size={14} className="text-mutedDim" />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-[46px] w-52 rounded-xl border border-border bg-surface p-1.5 shadow-xl">
                    <Link
                      to="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-[13.5px] hover:bg-surface2"
                    >
                      <UserIcon size={15} /> View profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[13.5px] text-[#FF5470] hover:bg-surface2"
                    >
                      <LogOut size={15} /> Log out
                    </button>
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-1.5 rounded-full border border-transparent p-0.5 hover:border-border"
              >
                <Avatar name={profile?.displayName || user.email} size={34} />
                <ChevronDown size={14} className="text-mutedDim" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-[46px] w-52 rounded-2xl border border-borderStrong bg-surface p-1.5 shadow-2xl backdrop-blur-xl">
                  <div className="border-b border-border px-3 py-2 text-[12px] text-mutedDim truncate">
                    {profile?.displayName || user.email}
                  </div>
                )}
              </div>
            </>
                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-[13.5px] text-text hover:bg-surface2 transition-colors"
                  >
                    <UserIcon size={15} /> {t("nav.profile")}
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[13.5px] text-[#FF5470] hover:bg-surface2 transition-colors"
                  >
                    <LogOut size={15} /> {t("nav.logout")}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <GhostButton small onClick={() => navigate("/login")}>
              Log in
              {t("nav.login")}
            </GhostButton>
          )}
        </div>
      </div>
    </div>
  );
}
