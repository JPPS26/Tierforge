import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
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
  Compass,
  Trophy,
  Menu,
  LogIn,
  Zap,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { Avatar, PrimaryButton, Badge } from "./UI";
import ProfileEditModal from "./ProfileEditModal";
import NotificationsDropdown from "./NotificationsDropdown";
import TierWorldLogo from "./TierWorldLogo";
import { searchOmni } from "../services/db";

export default function Navbar() {
  const { user, profile, logout } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const [q, setQ] = useState("");
  const [searchResults, setSearchResults] = useState({ creators: [], tierlists: [] });
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);
  const menuContainerRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Fecha o menu móvel em qualquer mudança de rota
  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileSearchOpen(false);
    setSearchOpen(false);
    setMenuOpen(false);
  }, [location.pathname]);

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

  // Atalho de teclado global Ctrl+K / Cmd+K para focar a barra de pesquisa
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        setSearchOpen(true);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Omni-Search com debounce
  useEffect(() => {
    if (!q.trim() || q.trim().length < 2) {
      setSearchResults({ creators: [], tierlists: [] });
      setSearchOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      const results = await searchOmni(q);
      setSearchResults(results);
      setSearchOpen(true);
    }, 180);

    return () => clearTimeout(timer);
  }, [q]);

  async function handleLogout() {
    await logout();
    setMenuOpen(false);
    setMobileMenuOpen(false);
    navigate("/");
  }

  function handleSearchSubmit(e) {
    if (e.key === "Enter" && q.trim()) {
      setSearchOpen(false);
      setMobileSearchOpen(false);
      navigate(`/explore?search=${encodeURIComponent(q.trim())}`);
    }
  }

  const hasResults = searchResults.creators.length > 0 || searchResults.tierlists.length > 0;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border/70 bg-[#09090D]/85 backdrop-blur-xl transition-all duration-200">
        <div className="mx-auto flex h-[70px] max-w-[1280px] items-center justify-between gap-3 sm:gap-6 px-4 sm:px-6">
          {/* Lado Esquerdo: Logótipo & Navegação Segmentada Desktop */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex flex-shrink-0 items-center gap-2.5 group select-none">
              <TierWorldLogo size={36} showText={true} />
            </Link>

            {/* Pílula de Navegação Segmentada (Desktop) */}
            <nav className="hidden items-center gap-1 md:flex rounded-2xl border border-border/50 bg-surface/50 p-1 backdrop-blur-md">
              <Link
                to="/explore"
                className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-[13.5px] font-medium transition-all ${
                  location.pathname === "/explore"
                    ? "bg-accent/20 text-white font-semibold shadow-sm border border-accent/40"
                    : "text-muted hover:text-white hover:bg-surface2/60"
                }`}
              >
                <Compass
                  size={15}
                  className={location.pathname === "/explore" ? "text-accent" : "text-mutedDim"}
                />
                <span>{t("nav.explore")}</span>
              </Link>
              <Link
                to="/categories"
                className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-[13.5px] font-medium transition-all ${
                  location.pathname === "/categories"
                    ? "bg-accent/20 text-white font-semibold shadow-sm border border-accent/40"
                    : "text-muted hover:text-white hover:bg-surface2/60"
                }`}
              >
                <Layers
                  size={15}
                  className={location.pathname === "/categories" ? "text-accent" : "text-mutedDim"}
                />
                <span>{t("nav.categories")}</span>
              </Link>
              <Link
                to="/leaderboard"
                className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-[13.5px] font-medium transition-all ${
                  location.pathname === "/leaderboard"
                    ? "bg-accent/20 text-white font-semibold shadow-sm border border-accent/40"
                    : "text-muted hover:text-white hover:bg-surface2/60"
                }`}
              >
                <Trophy
                  size={15}
                  className={location.pathname === "/leaderboard" ? "text-accent" : "text-mutedDim"}
                />
                <span>{t("nav.leaderboard")}</span>
              </Link>
            </nav>
          </div>

          {/* Centro: Barra de Pesquisa Omni-Search (Desktop) */}
          <div className="relative hidden max-w-[360px] flex-1 lg:block" ref={searchContainerRef}>
            <div className="relative flex items-center">
              <Search size={15} className="pointer-events-none absolute left-3.5 text-mutedDim" />
              <input
                ref={searchInputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onFocus={() => {
                  if (q.trim().length >= 2) setSearchOpen(true);
                }}
                onKeyDown={handleSearchSubmit}
                placeholder={t("nav.searchPlaceholder")}
                className="w-full rounded-2xl border border-border/70 bg-surface/70 py-2.5 pl-9 pr-14 text-[13px] text-text outline-none transition-all placeholder:text-mutedDim focus:border-accent focus:bg-surface focus:shadow-glow"
              />
              {q ? (
                <button
                  type="button"
                  onClick={() => {
                    setQ("");
                    setSearchOpen(false);
                  }}
                  className="absolute right-3 text-mutedDim hover:text-white"
                >
                  <X size={14} />
                </button>
              ) : (
                <span className="pointer-events-none absolute right-2.5 rounded-lg border border-border bg-surface2/60 px-1.5 py-0.5 font-mono text-[10px] text-mutedDim">
                  ⌘K
                </span>
              )}
            </div>

            {/* Dropdown de Resultados da Pesquisa Omni */}
            {searchOpen && (
              <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-borderStrong bg-[#12131A] p-2 shadow-2xl backdrop-blur-2xl animate-fadeIn">
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

          {/* Lado Direito: Ações, Idioma, Botões e Avatar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Botão de Pesquisa Rápida (Mobile/Tablet) */}
            <button
              type="button"
              onClick={() => setMobileSearchOpen((prev) => !prev)}
              aria-label="Abrir pesquisa"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-muted hover:border-borderStrong hover:text-white transition-colors lg:hidden"
            >
              <Search size={16} />
            </button>

            {/* Notificações no Próprio Site */}
            {user && <NotificationsDropdown />}

            {/* Botão de Criação com Gradiente */}
            <button
              type="button"
              onClick={() => navigate("/create")}
              className="hidden sm:flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7C5CFF] to-[#6A46F0] px-4 py-2 text-[13px] font-bold text-white shadow-glow hover:from-[#8B6EFA] hover:to-[#7954F5] active:scale-[0.98] transition-all"
            >
              <Plus size={16} />
              <span>{t("nav.create")}</span>
            </button>

            {/* Menu de Perfil / Iniciar Sessão */}
            {user ? (
              <div className="relative" ref={menuContainerRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-1.5 rounded-full border border-border/80 bg-surface2/60 p-0.5 transition-all hover:border-accent hover:scale-105 active:scale-95"
                >
                  <Avatar
                    name={profile?.displayName || user.email}
                    image={profile?.avatar || user.photoURL}
                    size={34}
                  />
                  <ChevronDown
                    size={14}
                    className={`text-mutedDim mr-1 transition-transform duration-200 ${
                      menuOpen ? "rotate-180 text-accent" : ""
                    }`}
                  />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-[46px] w-60 rounded-2xl border border-borderStrong bg-[#12131A] p-2 shadow-2xl backdrop-blur-2xl animate-fadeIn z-50">
                    <div className="border-b border-border/80 px-3 py-3">
                      <div className="text-[13.5px] font-bold text-white truncate">
                        {profile?.displayName || user.displayName || "Criador"}
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <span className="text-[12px] font-semibold text-accent">
                          #{profile?.handle || "jogador"}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-md bg-accentSoft px-1.5 py-0.5 text-[10px] font-bold text-[#B6A5FF]">
                          <Zap size={10} />
                          {profile?.creatorXp || 0} XP
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-0.5 pt-1.5">
                      <Link
                        to={`/profile/${profile?.handle || ""}`}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium text-text hover:bg-surface2 transition-colors"
                      >
                        <UserIcon size={15} className="text-muted" />
                        <span>{t("nav.profile")}</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          setEditProfileOpen(true);
                        }}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium text-text hover:bg-surface2 transition-colors text-left"
                      >
                        <Settings size={15} className="text-muted" />
                        <span>{t("nav.editProfile")}</span>
                      </button>

                      <div className="my-1 border-t border-border/60"></div>

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-[#FF5470] hover:bg-[#FF5470]/10 transition-colors"
                      >
                        <LogOut size={15} />
                        <span>{t("nav.logout")}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-[13px] font-semibold text-white transition-all hover:bg-white/10 hover:border-white/20 active:scale-95"
              >
                <LogIn size={15} className="text-accent" />
                <span>{t("nav.login")}</span>
              </button>
            )}

            {/* Botão do Menu Hambúrguer (Mobile) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Menu principal"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-muted hover:border-borderStrong hover:text-white transition-colors md:hidden"
            >
              {mobileMenuOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </div>

        {/* Barra de Pesquisa Expansível (Mobile / Tablet) */}
        {mobileSearchOpen && (
          <div className="border-t border-border/70 bg-[#0C0D14]/95 p-3 backdrop-blur-xl lg:hidden animate-fadeIn">
            <div className="relative flex items-center">
              <Search size={15} className="pointer-events-none absolute left-3.5 text-mutedDim" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={handleSearchSubmit}
                placeholder={t("nav.searchPlaceholder")}
                autoFocus
                className="w-full rounded-xl border border-border bg-surface py-2.5 pl-9 pr-9 text-[13px] text-text outline-none focus:border-accent"
              />
              {q && (
                <button
                  type="button"
                  onClick={() => setQ("")}
                  className="absolute right-3 text-mutedDim hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Resultados de Pesquisa no Mobile */}
            {hasResults && (
              <div className="mt-2 max-h-[260px] overflow-y-auto rounded-xl border border-border bg-surface p-2 shadow-lg">
                {searchResults.creators.map((c) => (
                  <Link
                    key={c.uid}
                    to={`/profile/${c.handle}`}
                    onClick={() => setMobileSearchOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg p-2 hover:bg-surface2"
                  >
                    <Avatar name={c.displayName} image={c.avatar} size={26} />
                    <span className="text-[13px] font-semibold text-white">{c.displayName}</span>
                    <span className="text-[11.5px] text-accent">#{c.handle}</span>
                  </Link>
                ))}
                {searchResults.tierlists.map((l) => (
                  <Link
                    key={l.id}
                    to={`/tier-list/${l.id}`}
                    onClick={() => setMobileSearchOpen(false)}
                    className="block rounded-lg p-2 text-[13px] font-medium text-text hover:bg-surface2"
                  >
                    {l.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Drawer de Navegação Mobile Completo */}
        {mobileMenuOpen && (
          <nav
            ref={mobileMenuRef}
            className="border-t border-border/80 bg-[#0A0B10]/95 px-4 py-5 backdrop-blur-2xl md:hidden animate-slideUp shadow-2xl flex flex-col gap-3"
          >
            <div className="flex flex-col gap-1.5">
              <Link
                to="/explore"
                className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-[14px] font-medium transition-all ${
                  location.pathname === "/explore"
                    ? "bg-accent/20 text-white font-bold border border-accent/40"
                    : "text-muted hover:bg-surface hover:text-white"
                }`}
              >
                <Compass size={17} className={location.pathname === "/explore" ? "text-accent" : ""} />
                <span>{t("nav.explore")}</span>
              </Link>
              <Link
                to="/categories"
                className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-[14px] font-medium transition-all ${
                  location.pathname === "/categories"
                    ? "bg-accent/20 text-white font-bold border border-accent/40"
                    : "text-muted hover:bg-surface hover:text-white"
                }`}
              >
                <Layers
                  size={17}
                  className={location.pathname === "/categories" ? "text-accent" : ""}
                />
                <span>{t("nav.categories")}</span>
              </Link>
              <Link
                to="/leaderboard"
                className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-[14px] font-medium transition-all ${
                  location.pathname === "/leaderboard"
                    ? "bg-accent/20 text-white font-bold border border-accent/40"
                    : "text-muted hover:bg-surface hover:text-white"
                }`}
              >
                <Trophy
                  size={17}
                  className={location.pathname === "/leaderboard" ? "text-accent" : ""}
                />
                <span>{t("nav.leaderboard")}</span>
              </Link>
            </div>

            <div className="pt-2 border-t border-border/60 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => navigate("/create")}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7C5CFF] to-[#6A46F0] py-3 text-[14px] font-bold text-white shadow-glow"
              >
                <Plus size={17} />
                <span>{t("nav.create")}</span>
              </button>

              {user ? (
                <Link
                  to={`/profile/${profile?.handle || ""}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-surface2/70 p-3 text-[13.5px] font-bold text-white hover:bg-surface2 transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar
                      name={profile?.displayName || user.displayName || "Criador"}
                      image={profile?.avatar || user.photoURL}
                      size={28}
                    />
                    <div className="truncate">
                      <div className="text-[13px] font-bold text-white truncate">
                        {profile?.displayName || user.displayName || "Criador"}
                      </div>
                      <div className="text-[11px] text-accent font-semibold">
                        #{profile?.handle || "jogador"}
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] text-mutedDim font-semibold">
                    {t("nav.profile")} →
                  </span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate("/login");
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-surface py-2.5 text-[13.5px] font-bold text-white hover:bg-surface2 transition-all"
                >
                  <LogIn size={16} className="text-accent" />
                  <span>{t("nav.login")}</span>
                </button>
              )}
            </div>
          </nav>
        )}
      </header>

      {/* Modal de Edição de Perfil */}
      <ProfileEditModal
        isOpen={editProfileOpen}
        onClose={() => setEditProfileOpen(false)}
        onSaveSuccess={(updated) => {
          if (updated && updated.handle && location.pathname.startsWith("/profile")) {
            navigate(`/profile/${updated.handle}`, { replace: true });
          }
        }}
      />
    </>
  );
}
