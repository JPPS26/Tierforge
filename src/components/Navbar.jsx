import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  ChevronDown,
  LogOut,
  User as UserIcon,
  Settings,
  Users,
  Layers,
  X,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { Avatar, PrimaryButton, GhostButton, Badge } from "./UI";
import LanguageSelector from "./LanguageSelector";
import ProfileEditModal from "./ProfileEditModal";
import { searchOmni } from "../services/db";

export default function Navbar() {
  const { user, profile, logout } = useAuth();
  const { t } = useLanguage();
  const [q, setQ] = useState("");
  const [searchResults, setSearchResults] = useState({ creators: [], tierlists: [] });
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);

  const searchContainerRef = useRef(null);
  const menuContainerRef = useRef(null);
  const navigate = useNavigate();

  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
      if (menuContainerRef.current && !menuContainerRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Omni-Search com debounce
  useEffect(() => {
    if (!q.trim() || q.trim().length < 2) {
      setSearchResults({ creators: [], tierlists: [] });
      setSearchOpen(false);
      return;
    }

    const timer = setTimeout(() => {
      const results = searchOmni(q);
      setSearchResults(results);
      setSearchOpen(true);
    }, 200);

    return () => clearTimeout(timer);
  }, [q]);

  async function handleLogout() {
    await logout();
    setMenuOpen(false);
    navigate("/");
  }

  function handleSearchSubmit(e) {
    if (e.key === "Enter" && q.trim()) {
      setSearchOpen(false);
      navigate(`/explore?search=${encodeURIComponent(q.trim())}`);
    }
  }

  const hasResults = searchResults.creators.length > 0 || searchResults.tierlists.length > 0;

  return (
    <>
      <div className="sticky top-0 z-40 border-b border-border bg-bg/85 backdrop-blur-md">
        <div className="mx-auto flex h-[68px] max-w-[1240px] items-center gap-4 sm:gap-6 px-4 sm:px-6">
          {/* Logótipo */}
          <Link to="/" className="flex flex-shrink-0 items-center gap-2.5 group">
            <div
              className="flex h-[34px] w-[34px] items-center justify-center rounded-[11px] shadow-glow transition-transform group-hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #9A7CFF 0%, #6A46F0 100%)",
              }}
            >
              <span className="font-display text-[17px] font-black text-[#0A0A0D]">T</span>
            </div>
            <span className="font-display text-[20px] font-black tracking-tight text-white">
              {t("nav.brand")}
            </span>
          </Link>

          {/* Links de Navegação */}
          <div className="hidden gap-1 md:flex">
            <Link
              to="/explore"
              className="rounded-xl px-3 py-2 text-[14px] font-semibold text-muted hover:text-text transition-colors"
            >
              {t("nav.explore")}
            </Link>
            <Link
              to="/categories"
              className="rounded-xl px-3 py-2 text-[14px] font-semibold text-muted hover:text-text transition-colors"
            >
              {t("nav.categories")}
            </Link>
            <Link
              to="/leaderboard"
              className="rounded-xl px-3 py-2 text-[14px] font-semibold text-muted hover:text-text transition-colors"
            >
              {t("nav.leaderboard")}
            </Link>
          </div>

          {/* Barra de Pesquisa Omni-Search */}
          <div className="relative hidden max-w-[380px] flex-1 lg:block" ref={searchContainerRef}>
            <Search size={15} className="absolute left-3.5 top-[11px] text-mutedDim" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onFocus={() => {
                if (q.trim().length >= 2) setSearchOpen(true);
              }}
              onKeyDown={handleSearchSubmit}
              placeholder={t("nav.searchPlaceholder")}
              className="w-full rounded-xl border border-border bg-surface py-2 pl-9 pr-8 text-[13px] text-text outline-none transition-colors focus:border-accent"
            />
            {q && (
              <button
                type="button"
                onClick={() => {
                  setQ("");
                  setSearchOpen(false);
                }}
                className="absolute right-2.5 top-[10px] text-mutedDim hover:text-text"
              >
                <X size={14} />
              </button>
            )}

            {/* Dropdown de Resultados da Pesquisa Omni */}
            {searchOpen && (
              <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-borderStrong bg-surface p-2 shadow-2xl backdrop-blur-xl">
                {!hasResults ? (
                  <div className="py-6 text-center text-[13px] text-mutedDim">
                    {t("search.noResults", { query: q })}
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 max-h-[380px] overflow-y-auto p-1">
                    {/* Secção Criadores */}
                    {searchResults.creators.length > 0 && (
                      <div>
                        <div className="mb-1.5 px-2.5 text-[11px] font-bold uppercase tracking-wider text-mutedDim flex items-center gap-1.5">
                          <Users size={12} /> {t("search.creators")}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          {searchResults.creators.map((c) => (
                            <Link
                              key={c.uid}
                              to={`/profile/${c.handle}`}
                              onClick={() => setSearchOpen(false)}
                              className="flex items-center justify-between rounded-xl px-2.5 py-2 hover:bg-surface2 transition-colors"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <Avatar name={c.displayName} image={c.avatar} size={28} />
                                <div className="truncate">
                                  <div className="text-[13px] font-bold text-text truncate">
                                    {c.displayName}
                                  </div>
                                  <div className="text-[11.5px] text-accent font-semibold">
                                    #{c.handle}
                                  </div>
                                </div>
                              </div>
                              <span className="text-[11px] font-semibold text-mutedDim">
                                {c.creatorXp || 0} XP
                              </span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Secção Tier Lists */}
                    {searchResults.tierlists.length > 0 && (
                      <div>
                        <div className="mb-1.5 px-2.5 text-[11px] font-bold uppercase tracking-wider text-mutedDim flex items-center gap-1.5">
                          <Layers size={12} /> {t("search.tierlists")}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          {searchResults.tierlists.map((l) => (
                            <Link
                              key={l.id}
                              to={`/tier-list/${l.id}`}
                              onClick={() => setSearchOpen(false)}
                              className="flex items-center justify-between rounded-xl px-2.5 py-2 hover:bg-surface2 transition-colors"
                            >
                              <div className="truncate pr-2">
                                <div className="text-[13px] font-bold text-text truncate">
                                  {l.title}
                                </div>
                                <div className="text-[11.5px] text-mutedDim">
                                  {l.creator} • {l.votes || 0} {t("home.statVotes").toLowerCase()}
                                </div>
                              </div>
                              <Badge tone="accent">{l.category?.toUpperCase()}</Badge>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Ações da Direita */}
          <div className="ml-auto flex items-center gap-2.5 sm:gap-3">
            <LanguageSelector />

            <PrimaryButton small icon={Plus} onClick={() => navigate("/create")}>
              <span className="hidden sm:inline">{t("nav.create")}</span>
              <span className="sm:hidden">Criar</span>
            </PrimaryButton>

            {/* Menu de Perfil */}
            {user ? (
              <div className="relative" ref={menuContainerRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-1.5 rounded-full border border-border/80 p-0.5 transition-transform hover:scale-105"
                >
                  <Avatar
                    name={profile?.displayName || user.email}
                    image={profile?.avatar || user.photoURL}
                    size={34}
                  />
                  <ChevronDown size={14} className="text-mutedDim mr-1" />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-[46px] w-56 rounded-2xl border border-borderStrong bg-surface p-2 shadow-2xl backdrop-blur-xl animate-fadeIn">
                    <div className="border-b border-border px-3 py-2.5">
                      <div className="text-[13.5px] font-bold text-white truncate">
                        {profile?.displayName || user.displayName || "Criador"}
                      </div>
                      <div className="text-[12px] font-semibold text-accent">
                        #{profile?.handle || "jogador"}
                      </div>
                    </div>

                    <div className="flex flex-col gap-0.5 pt-1.5">
                      <Link
                        to={`/profile/${profile?.handle || ""}`}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-medium text-text hover:bg-surface2 transition-colors"
                      >
                        <UserIcon size={15} /> {t("nav.profile")}
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          setEditProfileOpen(true);
                        }}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-medium text-text hover:bg-surface2 transition-colors text-left"
                      >
                        <Settings size={15} /> {t("nav.editProfile")}
                      </button>

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-[#FF5470] hover:bg-surface2 transition-colors"
                      >
                        <LogOut size={15} /> {t("nav.logout")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <GhostButton small onClick={() => navigate("/login")}>
                {t("nav.login")}
              </GhostButton>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Edição de Perfil */}
      <ProfileEditModal
        isOpen={editProfileOpen}
        onClose={() => setEditProfileOpen(false)}
      />
    </>
  );
}
